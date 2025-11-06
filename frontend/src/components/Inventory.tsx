import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SALVAGING_RESOURCES, SALVAGING_RESOURCE_IMAGES } from '../types/salvagingResources'
import { SMELTING_RECIPES } from '../types/smeltingResources'
import { ENGINEERING_RECIPES } from '../types/engineeringResources'
import { FOOD_RESOURCES } from '../types/foodResources'
import { HERB_RESOURCES } from '../types/herbResources'
import { MEDICAL_ITEMS } from '../types/medicalItems'
import './Inventory.css'

export default function Inventory() {
  const { inventoryOpen, resources, removeResource, addGold, knowledgePoints } = useGameStore()
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [sellAmount, setSellAmount] = useState<number>(1)

  if (!inventoryOpen) return null

  const getResourceData = (resourceId: string) => {
    // Check salvaging resources first
    const salvaging = SALVAGING_RESOURCES.find((r) => r.id === resourceId)
    if (salvaging) return salvaging
    
    // Check smelting recipes (smelted metals)
    const smelting = SMELTING_RECIPES.find((r) => r.id === resourceId)
    if (smelting) {
      return {
        id: smelting.id,
        name: smelting.name,
        icon: smelting.icon || '⚙️',
        value: 0, // Smelted metals don't have direct value, they're crafting materials
        description: smelting.description,
      }
    }
    
    // Check engineering recipes (crafted gear)
    const engineering = ENGINEERING_RECIPES.find((r) => r.id === resourceId)
    if (engineering) {
      return {
        id: engineering.id,
        name: engineering.name,
        icon: engineering.icon || '⚙️',
        image: engineering.image, // Include image path
        value: engineering.value,
        description: engineering.description,
        equipmentStats: engineering.equipmentStats,
      }
    }

    // Check food resources
    const food = FOOD_RESOURCES.find((r) => r.id === resourceId)
    if (food) {
      return {
        id: food.id,
        name: food.name,
        icon: food.icon,
        value: food.value,
        description: food.description,
      }
    }

    // Check herb resources
    const herb = HERB_RESOURCES.find((r) => r.id === resourceId)
    if (herb) {
      return {
        id: herb.id,
        name: herb.name,
        icon: herb.icon,
        value: herb.value,
        description: herb.description,
      }
    }

    // Check medical items
    const medical = MEDICAL_ITEMS.find((r) => r.id === resourceId)
    if (medical) {
      return {
        id: medical.id,
        name: medical.name,
        icon: medical.icon,
        value: medical.value,
        description: medical.description,
      }
    }
    
    return null
  }

  const resourceEntries = Object.entries(resources)
    .filter(([_, amount]) => amount > 0)
    .sort(([a], [b]) => {
      // Sort by resource name
      const resA = getResourceData(a)
      const resB = getResourceData(b)
      return (resA?.name || a).localeCompare(resB?.name || b)
    })

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResource(resourceId)
    const amount = resources[resourceId] || 0
    setSellAmount(Math.min(1, amount))
  }

  const handleSell = () => {
    if (!selectedResource) return
    
    const resource = getResourceData(selectedResource)
    if (!resource || !resource.value || resource.value <= 0) return

    const amount = resources[selectedResource] || 0
    const sellQty = Math.min(sellAmount, amount)
    
    if (sellQty > 0) {
      removeResource(selectedResource, sellQty)
      addGold(resource.value * sellQty)
      setSellAmount(1)
      
      // Clear selection if all sold
      if (amount - sellQty === 0) {
        setSelectedResource(null)
      }
    }
  }

  const selectedResourceData = selectedResource ? getResourceData(selectedResource) : null
  const selectedAmount = selectedResource ? (resources[selectedResource] || 0) : 0
  const resourceValue = selectedResourceData?.value || 0
  const totalValue = resourceValue > 0 && sellAmount > 0 
    ? resourceValue * Math.min(sellAmount, selectedAmount)
    : 0

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <h2 className="inventory-title">INVENTORY</h2>
        <div className="inventory-header-stats">
          <div className="inventory-capacity">
            Items: {resourceEntries.length}
          </div>
          <div className="inventory-knowledge">
            <span className="knowledge-icon">📚</span>
            <span className="knowledge-label">Knowledge:</span>
            <span className="knowledge-value">{knowledgePoints.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="inventory-content-wrapper">
        <div className="inventory-grid-container">
          <div className="inventory-grid">
            {resourceEntries.length === 0 ? (
              <div className="inventory-empty">
                <p>No resources collected yet</p>
                <p className="inventory-hint">Start salvaging to gather resources!</p>
              </div>
            ) : (
              resourceEntries.map(([resourceId, amount]) => {
                const resource = getResourceData(resourceId)
                const isSelected = selectedResource === resourceId
                const isSalvagingResource = SALVAGING_RESOURCES.some((r) => r.id === resourceId)
                // Check for image: salvaging resources use SALVAGING_RESOURCE_IMAGES, engineering recipes use image property
                const imagePath = isSalvagingResource 
                  ? (SALVAGING_RESOURCE_IMAGES[resourceId] || '/images/resources/augment_equip.png')
                  : (resource && 'image' in resource && resource.image) 
                    ? resource.image 
                    : null
                
                return (
                  <div
                    key={resourceId}
                    className={`inventory-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleResourceSelect(resourceId)}
                  >
                    <div className="inventory-item-icon">
                      {imagePath ? (
                        <img 
                          src={imagePath}
                          alt={resource?.name || 'Resource'}
                          style={{ width: '2rem', height: '2rem', objectFit: 'contain' }}
                        />
                      ) : (
                        resource?.icon || '⚙️'
                      )}
                    </div>
                    <div className="inventory-item-quantity">
                      {amount.toLocaleString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {selectedResourceData && (
          <div className="inventory-details">
            <div className="details-header">
              <div className="details-icon">
                {(() => {
                  // Check for salvaging resource image
                  if (SALVAGING_RESOURCE_IMAGES[selectedResource]) {
                    return (
                      <img 
                        src={SALVAGING_RESOURCE_IMAGES[selectedResource]}
                        alt={selectedResourceData.name}
                        style={{ width: '3rem', height: '3rem', objectFit: 'contain' }}
                      />
                    )
                  }
                  // Check for engineering recipe image
                  if (selectedResourceData && 'image' in selectedResourceData && selectedResourceData.image) {
                    return (
                      <img 
                        src={selectedResourceData.image}
                        alt={selectedResourceData.name}
                        style={{ width: '3rem', height: '3rem', objectFit: 'contain' }}
                      />
                    )
                  }
                  // Fallback to icon
                  return selectedResourceData.icon || '⚙️'
                })()}
              </div>
              <div className="details-name">{selectedResourceData.name}</div>
            </div>
            <div className="details-description">
              {selectedResourceData.description}
            </div>

            {/* Equipment Stats */}
            {'equipmentStats' in selectedResourceData && selectedResourceData.equipmentStats && (
              <div className="equipment-stats-section">
                <div className="stats-section-title">EQUIPMENT STATS</div>
                <div className="stats-grid">
                  {selectedResourceData.equipmentStats.damage !== undefined && (
                    <div className="stat-row">
                      <span className="stat-label">Damage:</span>
                      <span className="stat-value">{selectedResourceData.equipmentStats.damage}</span>
                    </div>
                  )}
                  {selectedResourceData.equipmentStats.armor !== undefined && (
                    <div className="stat-row">
                      <span className="stat-label">Armor:</span>
                      <span className="stat-value">{selectedResourceData.equipmentStats.armor}</span>
                    </div>
                  )}
                  <div className="stat-row">
                    <span className="stat-label">Attack Type:</span>
                    <span className="stat-value">{selectedResourceData.equipmentStats.attackType.toUpperCase()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">XP Scale:</span>
                    <span className="stat-value">{selectedResourceData.equipmentStats.attackScale}x</span>
                  </div>
                  {selectedResourceData.equipmentStats.hitChance !== undefined && (
                    <div className="stat-row">
                      <span className="stat-label">Hit Chance:</span>
                      <span className="stat-value">+{selectedResourceData.equipmentStats.hitChance}%</span>
                    </div>
                  )}
                  {selectedResourceData.equipmentStats.critChance !== undefined && (
                    <div className="stat-row">
                      <span className="stat-label">Crit Chance:</span>
                      <span className="stat-value">+{selectedResourceData.equipmentStats.critChance}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedResourceData.value > 0 && (
            <div className="sell-section">
              <div className="sell-title">SELL ITEM</div>
              <div className="sell-price">
                {selectedResourceData.value.toLocaleString()} <span className="gold-icon">🪙</span> per unit
              </div>
              
              <div className="sell-controls">
                <div className="sell-quick-buttons">
                  <button
                    className="sell-quick-btn"
                    onClick={() => setSellAmount(Math.max(1, selectedAmount - 1))}
                  >
                    All but 1
                  </button>
                  <button
                    className="sell-quick-btn"
                    onClick={() => setSellAmount(selectedAmount)}
                  >
                    All
                  </button>
                </div>
                
                <div className="sell-amount-control">
                  <input
                    type="number"
                    min="1"
                    max={selectedAmount}
                    value={sellAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setSellAmount(Math.max(1, Math.min(val, selectedAmount)))
                    }}
                    className="sell-amount-input"
                  />
                  <span className="sell-amount-max">/ {selectedAmount}</span>
                </div>
                
                <button
                  className="sell-button"
                  onClick={handleSell}
                  disabled={sellAmount <= 0 || sellAmount > selectedAmount}
                >
                  SELL ITEM
                </button>
                
                <div className="sell-total">
                  Total: {totalValue.toLocaleString()} <span className="gold-icon">🪙</span>
                </div>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
