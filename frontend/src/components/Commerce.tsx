import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Planet, PlanetType, PLANET_TYPES } from '../types/planets'
import { generatePlanetTradeItems, checkAndRotatePlanet } from '../utils/tradeGeneration'
import './Commerce.css'

interface CommerceProps {
  skillId: string
}

export default function Commerce({ skillId }: CommerceProps) {
  const {
    planets,
    gold,
    resources,
    skillCategories,
    addGold,
    addResource,
    removeResource,
    updatePlanetTradeItems,
    setPlanetRotation,
    addXP,
    addNotification,
  } = useGameStore()
  
  // Get Commerce skill level
  const commerceSkill = skillCategories
    .flatMap(cat => cat.skills)
    .find(skill => skill.id === skillId)
  const skillLevel = commerceSkill?.level || 1

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [selectedPlanetType, setSelectedPlanetType] = useState<PlanetType | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [tradeQuantities, setTradeQuantities] = useState<Record<string, number>>({})
  const initializedPlanetsRef = useRef<Set<string>>(new Set())

  // Update time for rotations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Check and rotate planet trade items
  useEffect(() => {
    planets.forEach((planet) => {
      if (planet.discovered) {
        const rotatedPlanet = checkAndRotatePlanet(planet, currentTime)
        if (rotatedPlanet) {
          updatePlanetTradeItems(planet.id, rotatedPlanet.tradeItems)
          setPlanetRotation(planet.id, rotatedPlanet.nextRotation)
          addNotification(`${planet.name} trade inventory has rotated!`)
        }
      }
    })
  }, [currentTime, planets, updatePlanetTradeItems, setPlanetRotation, addNotification])

  // Initialize trade items for newly discovered planets
  useEffect(() => {
    // Only initialize planets that:
    // 1. Are discovered
    // 2. Have no trade items (or empty array)
    // 3. Haven't been initialized yet (tracked by ref)
    planets.forEach((planet) => {
      if (
        planet.discovered &&
        (!planet.tradeItems || planet.tradeItems.length === 0) &&
        !initializedPlanetsRef.current.has(planet.id)
      ) {
        // Mark as initialized BEFORE updating to prevent re-triggering
        initializedPlanetsRef.current.add(planet.id)
        const tradeItems = generatePlanetTradeItems(planet)
        updatePlanetTradeItems(planet.id, tradeItems)
      }
    })
    // Only run when planets array reference changes (new planets discovered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planets.length, planets.filter(p => p.discovered).map(p => p.id).join(',')])

  const discoveredPlanets = planets.filter((p) => p.discovered)

  const getPlanetsByType = (type: PlanetType) => {
    return discoveredPlanets.filter((p) => p.type === type)
  }

  const allPlanetTypes: PlanetType[] = [
    'agri-world',
    'mining-world',
    'grave-world',
    'forge-world',
    'research-world',
    'shrine-world',
    'hive-world',
    'death-world',
    'void-station',
  ]

  const displayedPlanets = selectedPlanetType
    ? getPlanetsByType(selectedPlanetType)
    : discoveredPlanets

  const handleBuy = (planet: Planet, tradeItem: typeof planet.tradeItems[0]) => {
    if (!tradeItem.buyPrice) return

    const quantity = tradeQuantities[`${planet.id}-${tradeItem.resourceId}-buy`] || 1
    const totalCost = tradeItem.buyPrice * quantity

    if (gold < totalCost) {
      addNotification(`Not enough gold! Need ${totalCost.toLocaleString()} gold.`)
      return
    }

    if (tradeItem.availableQuantity > 0 && quantity > tradeItem.availableQuantity) {
      addNotification(`Only ${tradeItem.availableQuantity} available!`)
      return
    }

    addGold(-totalCost)
    addResource(tradeItem.resourceId, quantity)
    addXP(skillId, Math.floor(quantity * 2))
    addNotification(`Bought ${quantity}x ${tradeItem.resourceName} from ${planet.name} for ${totalCost.toLocaleString()} gold`)

    // Update available quantity if limited
    if (tradeItem.availableQuantity > 0) {
      const updatedItems = planet.tradeItems.map((item) =>
        item.resourceId === tradeItem.resourceId
          ? { ...item, availableQuantity: Math.max(0, item.availableQuantity - quantity) }
          : item
      )
      updatePlanetTradeItems(planet.id, updatedItems)
    }
  }

  const handleSell = (planet: Planet, tradeItem: typeof planet.tradeItems[0]) => {
    if (!tradeItem.sellPrice) return

    const quantity = tradeQuantities[`${planet.id}-${tradeItem.resourceId}-sell`] || 1
    const playerQuantity = resources[tradeItem.resourceId] || 0

    if (playerQuantity < quantity) {
      addNotification(`Not enough ${tradeItem.resourceName}! You have ${playerQuantity}.`)
      return
    }

    const totalValue = tradeItem.sellPrice * quantity

    removeResource(tradeItem.resourceId, quantity)
    addGold(totalValue)
    addXP(skillId, Math.floor(quantity * 2))
    addNotification(`Sold ${quantity}x ${tradeItem.resourceName} to ${planet.name} for ${totalValue.toLocaleString()} gold`)
  }

  const formatTimeUntilRotation = (nextRotation: number) => {
    const ms = nextRotation - currentTime
    if (ms <= 0) return 'Rotating...'
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getProfitMargin = (buyPrice: number | null, sellPrice: number | null) => {
    if (!buyPrice || !sellPrice) return null
    const profit = sellPrice - buyPrice
    const margin = ((sellPrice - buyPrice) / buyPrice) * 100
    return { profit, margin }
  }

  if (discoveredPlanets.length === 0) {
    return (
      <div className="commerce-container">
        <div className="no-planets-discovered">
          <h2>No Planets Discovered</h2>
          <p>Use the Communication skill to establish contact with planets first!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="commerce-container">
      <div className="commerce-header">
        <h1 className="commerce-title">💰 Trade Terminal</h1>
        <p className="commerce-subtitle">Buy low, sell high. Maximize your profits across the galaxy.</p>
      </div>

      {/* Planet Type Tabs */}
      <div className="planet-type-tabs">
        <button
          className={`tab-button ${selectedPlanetType === null ? 'active' : ''}`}
          onClick={() => {
            setSelectedPlanetType(null)
            setSelectedPlanet(null)
          }}
        >
          All ({discoveredPlanets.length})
        </button>
        {allPlanetTypes.map((type) => {
          const typeInfo = PLANET_TYPES[type]
          const count = getPlanetsByType(type).length
          if (count === 0) return null
          return (
            <button
              key={type}
              className={`tab-button ${selectedPlanetType === type ? 'active' : ''}`}
              onClick={() => {
                setSelectedPlanetType(type)
                setSelectedPlanet(null)
              }}
            >
              {typeInfo.icon} {typeInfo.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Split Screen: Planet List | Trade Interface */}
      <div className="commerce-split-screen">
        {/* Left: Planet List */}
        <div className="planet-list-panel">
          <h2 className="panel-title">Available Planets</h2>
          <div className="planets-list">
            {displayedPlanets.map((planet) => {
              const typeInfo = PLANET_TYPES[planet.type]
              const isSelected = selectedPlanet?.id === planet.id
              const timeUntilRotation = formatTimeUntilRotation(planet.nextRotation)

              return (
                <div
                  key={planet.id}
                  className={`planet-list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPlanet(planet)}
                >
                  <div className="planet-list-header">
                    <span className="planet-list-icon">{typeInfo.icon}</span>
                    <div className="planet-list-info">
                      <h3 className="planet-list-name">{planet.name}</h3>
                      <p className="planet-list-type">{typeInfo.name}</p>
                    </div>
                  </div>
                  <div className="planet-list-details">
                    <span className="rotation-info">Rotation: {timeUntilRotation}</span>
                    <span className="trade-items-count">{planet.tradeItems.length} items</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Trade Interface */}
        <div className="trade-panel">
          {selectedPlanet ? (
            <>
              <div className="trade-panel-header">
                <h2 className="panel-title">
                  {PLANET_TYPES[selectedPlanet.type].icon} {selectedPlanet.name}
                </h2>
                <p className="rotation-text">
                  Next rotation: {formatTimeUntilRotation(selectedPlanet.nextRotation)}
                </p>
              </div>

              <div className="trade-split-view">
                {/* Buy Section */}
                <div className="trade-section buy-section">
                  <h3 className="trade-section-title">🛒 BUY</h3>
                  <div className="trade-items-list">
                    {selectedPlanet.tradeItems
                      .filter((item) => item.buyPrice !== null)
                      .map((item) => {
                        const playerQuantity = resources[item.resourceId] || 0
                        const quantity = tradeQuantities[`${selectedPlanet.id}-${item.resourceId}-buy`] || 1
                        const totalCost = (item.buyPrice || 0) * quantity
                        const canAfford = gold >= totalCost
                        const available = item.availableQuantity === 0 || quantity <= item.availableQuantity

                        return (
                          <div key={`${selectedPlanet.id}-${item.resourceId}-buy`} className="trade-item-card">
                            <div className="trade-item-header">
                              <span className="trade-item-icon">
                                {item.icon.startsWith('/') ? (
                                  <img 
                                    src={item.icon}
                                    alt={item.resourceName}
                                    style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                                  />
                                ) : (
                                  item.icon
                                )}
                              </span>
                              <div className="trade-item-info">
                                <h4 className="trade-item-name">{item.resourceName}</h4>
                                <p className="trade-item-price">
                                  {item.buyPrice?.toLocaleString()} gold each
                                </p>
                              </div>
                            </div>
                            <div className="trade-item-body">
                              {item.availableQuantity > 0 && (
                                <p className="availability">
                                  Available: {item.availableQuantity} / You have: {playerQuantity}
                                </p>
                              )}
                              {item.availableQuantity === 0 && (
                                <p className="availability">Unlimited / You have: {playerQuantity}</p>
                              )}
                              <div className="trade-controls">
                                <input
                                  type="number"
                                  min="1"
                                  max={item.availableQuantity > 0 ? item.availableQuantity : 9999}
                                  value={quantity}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1)
                                    setTradeQuantities({
                                      ...tradeQuantities,
                                      [`${selectedPlanet.id}-${item.resourceId}-buy`]: val,
                                    })
                                  }}
                                  className="quantity-input"
                                />
                                <div className="trade-total">
                                  Total: {totalCost.toLocaleString()} gold
                                </div>
                                <button
                                  className={`trade-button buy-button ${canAfford && available ? '' : 'disabled'}`}
                                  onClick={() => handleBuy(selectedPlanet, item)}
                                  disabled={!canAfford || !available}
                                >
                                  Buy
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    {selectedPlanet.tradeItems.filter((item) => item.buyPrice !== null).length === 0 && (
                      <p className="no-trade-items">No items available for purchase</p>
                    )}
                  </div>
                </div>

                {/* Sell Section */}
                <div className="trade-section sell-section">
                  <h3 className="trade-section-title">💰 SELL</h3>
                  <div className="trade-items-list">
                    {selectedPlanet.tradeItems
                      .filter((item) => item.sellPrice !== null)
                      .map((item) => {
                        const playerQuantity = resources[item.resourceId] || 0
                        const quantity = tradeQuantities[`${selectedPlanet.id}-${item.resourceId}-sell`] || 1
                        const totalValue = (item.sellPrice || 0) * quantity
                        const canSell = playerQuantity >= quantity

                        // Check for profit opportunity
                        const buyItem = selectedPlanet.tradeItems.find(
                          (i) => i.resourceId === item.resourceId && i.buyPrice !== null
                        )
                        const profit = buyItem
                          ? getProfitMargin(buyItem.buyPrice, item.sellPrice)
                          : null

                        return (
                          <div key={`${selectedPlanet.id}-${item.resourceId}-sell`} className="trade-item-card">
                            <div className="trade-item-header">
                              <span className="trade-item-icon">
                                {item.icon.startsWith('/') ? (
                                  <img 
                                    src={item.icon}
                                    alt={item.resourceName}
                                    style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                                  />
                                ) : (
                                  item.icon
                                )}
                              </span>
                              <div className="trade-item-info">
                                <h4 className="trade-item-name">{item.resourceName}</h4>
                                <p className="trade-item-price">
                                  {item.sellPrice?.toLocaleString()} gold each
                                </p>
                              </div>
                            </div>
                            <div className="trade-item-body">
                              <p className="availability">You have: {playerQuantity}</p>
                              {profit && profit.profit > 0 && (
                                <p className="profit-indicator">
                                  💚 Profit: {profit.profit.toLocaleString()} ({profit.margin.toFixed(1)}%)
                                </p>
                              )}
                              <div className="trade-controls">
                                <input
                                  type="number"
                                  min="1"
                                  max={playerQuantity}
                                  value={quantity}
                                  onChange={(e) => {
                                    const val = Math.max(1, Math.min(playerQuantity, parseInt(e.target.value) || 1))
                                    setTradeQuantities({
                                      ...tradeQuantities,
                                      [`${selectedPlanet.id}-${item.resourceId}-sell`]: val,
                                    })
                                  }}
                                  className="quantity-input"
                                />
                                <div className="trade-total">
                                  Total: {totalValue.toLocaleString()} gold
                                </div>
                                <button
                                  className={`trade-button sell-button ${canSell ? '' : 'disabled'}`}
                                  onClick={() => handleSell(selectedPlanet, item)}
                                  disabled={!canSell}
                                >
                                  Sell
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    {selectedPlanet.tradeItems.filter((item) => item.sellPrice !== null).length === 0 && (
                      <p className="no-trade-items">No items available for sale</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-planet-selected">
              <p>Select a planet from the list to view trade options</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

