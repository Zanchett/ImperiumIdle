import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SEEDS, getSeedById } from '../types/seeds'
import { FOOD_RESOURCES } from '../types/foodResources'
import { getItemImage } from '../types/items'
import './Farming.css'
import './MainContent.css'

interface FarmingProps {
  skillId: string
}

export default function Farming({ skillId }: FarmingProps) {
  const {
    farmingPlots,
    gold,
    resources,
    skillCategories,
    skillVeterancies,
    purchaseFarmingPlot,
    plantSeed,
    harvestCrop,
    addNotification,
  } = useGameStore()

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [hoveredSeed, setHoveredSeed] = useState<string | null>(null)
  const [seedHoverPosition, setSeedHoverPosition] = useState({ x: 0, y: 0 })

  // Get Farming skill
  const farmingSkill = skillCategories
    .flatMap((cat) => cat.skills)
    .find((skill) => skill.id === skillId)
  const skillLevel = farmingSkill?.level || 1

  // Update time for crop growth
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Get seeds from inventory (owned seeds)
  const ownedSeeds = SEEDS.filter((seed) => {
    const count = resources[seed.id] || 0
    return count > 0 && seed.levelRequired <= skillLevel
  })

  // Calculate plot cost
  const getPlotCost = (plotIndex: number) => 100 * (plotIndex + 1)

  const handlePurchasePlot = () => {
    purchaseFarmingPlot()
  }

  const handlePlantSeed = (plotId: string, seedId: string) => {
    plantSeed(plotId, seedId)
    setSelectedPlotId(null)
  }

  const handleHarvest = (plotId: string) => {
    harvestCrop(plotId)
  }

  const getTimeRemaining = (readyAt: number | null) => {
    if (!readyAt) return 0
    return Math.max(0, Math.ceil((readyAt - currentTime) / 1000))
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (!farmingSkill) {
    return <div>Skill not found</div>
  }

  return (
    <>
      {/* Farming Plots */}
      <section className="farming-section">
        <h3 className="section-title">YOUR PLOTS ({farmingPlots.length})</h3>
        <button
          className="purchase-plot-button"
          onClick={handlePurchasePlot}
          disabled={gold < getPlotCost(farmingPlots.length)}
        >
          Purchase Plot ({getPlotCost(farmingPlots.length).toLocaleString()} gold)
        </button>
        {farmingPlots.length === 0 ? (
          <div className="no-plots">
            <p>You don't have any farming plots yet. Purchase one to get started!</p>
          </div>
        ) : (
          <div className="plots-grid">
            {farmingPlots.map((plot) => {
              const seed = plot.plantedSeedId ? getSeedById(plot.plantedSeedId) : null
              const foodResource = seed ? FOOD_RESOURCES.find((f) => f.id === seed.cropId) : null
              const timeRemaining = getTimeRemaining(plot.readyAt)
              const isReady = plot.readyAt && currentTime >= plot.readyAt

              return (
                <div key={plot.id} className={`plot-card ${plot.plantedSeedId ? 'planted' : 'empty'}`}>
                  {plot.plantedSeedId && seed ? (
                    <>
                      <div className="plot-status">
                        {isReady ? (
                          <span className="status-ready">READY TO HARVEST</span>
                        ) : (
                          <span className="status-growing">Growing...</span>
                        )}
                      </div>
                      <div className="plot-crop">
                        {foodResource?.image ? (
                          <img src={foodResource.image} alt={foodResource.name} />
                        ) : (
                          <span>{foodResource?.icon || '🌱'}</span>
                        )}
                      </div>
                      <div className="plot-crop-name">{foodResource?.name || seed.name.replace(' Seeds', '')}</div>
                      {!isReady && (
                        <div className="plot-timer">{formatTime(timeRemaining)}</div>
                      )}
                      <button
                        className="harvest-button"
                        onClick={() => handleHarvest(plot.id)}
                        disabled={!isReady}
                      >
                        {isReady ? 'Harvest' : 'Not Ready'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="plot-empty-icon">🌾</div>
                      <div className="plot-empty-text">Empty Plot</div>
                      <div className="select-seed-wrapper">
                        <button
                          className="select-seed-button"
                          onClick={() => setSelectedPlotId(selectedPlotId === plot.id ? null : plot.id)}
                          disabled={ownedSeeds.length === 0}
                        >
                          {selectedPlotId === plot.id ? 'Cancel' : 'Select Seed'}
                        </button>
                        {selectedPlotId === plot.id && (
                          <div className="seed-selection-dropdown">
                          {ownedSeeds.length === 0 ? (
                            <div className="no-seeds-message">
                              No seeds in inventory. Buy seeds from Commerce!
                            </div>
                          ) : (
                            <div className="seed-icons-grid">
                              {ownedSeeds.map((seed) => {
                                const count = resources[seed.id] || 0
                                return (
                                  <div
                                    key={seed.id}
                                    className="seed-icon-item"
                                    onClick={() => handlePlantSeed(plot.id, seed.id)}
                                    onMouseEnter={(e) => {
                                      setHoveredSeed(seed.id)
                                      setSeedHoverPosition({ x: e.clientX, y: e.clientY })
                                    }}
                                    onMouseLeave={() => setHoveredSeed(null)}
                                    onMouseMove={(e) => {
                                      if (hoveredSeed === seed.id) {
                                        setSeedHoverPosition({ x: e.clientX, y: e.clientY })
                                      }
                                    }}
                                  >
                                    {seed.image ? (
                                      <img src={seed.image} alt={seed.name} />
                                    ) : (
                                      <span>{seed.icon || '🌱'}</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
        </section>

      {/* Seed Tooltip */}
      {hoveredSeed && (() => {
        const seed = getSeedById(hoveredSeed)
        if (!seed) return null
        const count = resources[seed.id] || 0
        const foodResource = FOOD_RESOURCES.find((f) => f.id === seed.cropId)
        
        return (
          <div
            className="equipment-stats-tooltip"
            style={{
              position: 'fixed',
              left: `${seedHoverPosition.x + 15}px`,
              top: `${seedHoverPosition.y + 15}px`,
              zIndex: 10000,
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-icon">
                {seed.image ? (
                  <img src={seed.image} alt={seed.name} style={{ width: '1.2rem', height: '1.2rem', objectFit: 'contain' }} />
                ) : (
                  <span>{seed.icon || '🌱'}</span>
                )}
              </span>
              <span className="tooltip-title">{seed.name}</span>
            </div>
            <div className="tooltip-content">
              <div className="tooltip-stat">
                <span className="tooltip-label">Owned:</span>
                <span className="tooltip-value">{count.toLocaleString()}</span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">Grow Time:</span>
                <span className="tooltip-value">{formatTime(seed.growTime)}</span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">Yield:</span>
                <span className="tooltip-value">{seed.yield}x {foodResource?.name || seed.cropId}</span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">XP Reward:</span>
                <span className="tooltip-value">{seed.xpReward} XP</span>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}

