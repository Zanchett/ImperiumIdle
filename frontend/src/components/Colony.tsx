import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { BUILDING_DEFINITIONS, BuildingDefinition } from '../types/village'
import { calculateBuildingCost as calcBuildingCost, getMaxBuildingLimit, getMaxWorkersForLevel, calculateProductionBuildingUpgradeCost, getProductionRateMultiplier, getWorkerScalingMultiplier, calculateEffectiveProductionRate } from '../utils/village'
import './Colony.css'

interface ColonyProps {
  skillId: string
}

export default function Colony({ skillId }: ColonyProps) {
  const {
    village,
    skillCategories,
    startBuildingConstruction,
    completeBuildingConstruction,
    assignVillagerToBuilding,
    collectBuildingResources,
    updateBuildingProduction,
    upgradeBuilding,
    addNotification,
  } = useGameStore()

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [expandedSpecialized, setExpandedSpecialized] = useState<Set<string>>(new Set())
  const [selectedDashboard, setSelectedDashboard] = useState<'none' | 'food' | 'herb'>('none')

  const toggleSpecialized = (buildingId: string) => {
    setExpandedSpecialized((prev) => {
      const next = new Set(prev)
      if (next.has(buildingId)) {
        next.delete(buildingId)
      } else {
        next.add(buildingId)
      }
      return next
    })
  }

  const colonySkill = skillCategories
    .flatMap((cat) => cat.skills)
    .find((skill) => skill.id === skillId)
  const skillLevel = colonySkill?.level || 1

  // Update time every 100ms for smooth progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Check for completed constructions
  useEffect(() => {
    village.constructionQueue.forEach((building) => {
      if (building.constructionStartTime) {
        const elapsed = currentTime - building.constructionStartTime
        if (elapsed >= building.constructionDuration) {
          completeBuildingConstruction(building.id)
        }
      }
    })
  }, [currentTime, village.constructionQueue, completeBuildingConstruction])

  // Accumulate resources over time for production buildings
  useEffect(() => {
    const interval = setInterval(() => {
      updateBuildingProduction()
    }, 1000)

    return () => clearInterval(interval)
  }, [updateBuildingProduction])

  const getAvailableBuildings = () => {
    return BUILDING_DEFINITIONS.filter((def) => {
      // Skip City Hall (pre-built, handled separately)
      if (def.id === 'city-hall') return false
      
      // Skip logging station itself (it's always available)
      if (def.id === 'logging-station') return true
      
      // Must meet level requirement
      if (def.levelRequired > skillLevel) return false
      
      // If it's a main building (unlocks specialized buildings), only show if not already built
      if (def.unlocksSpecializedBuildings) {
        const alreadyBuilt = village.buildings.some((b) => b.type === def.id && b.completed)
        if (alreadyBuilt) return false // Don't show if already built
        return true
      }
      
      // If it requires a base building other than logging-station, don't show in main list (show in dropdown)
      if (def.requiresBaseBuilding && def.requiresBaseBuilding !== 'logging-station') return false
      
      // Otherwise, show it (will be shown as locked if logging station not built)
      return true
    })
  }

  const getLockedBuildings = () => {
    return BUILDING_DEFINITIONS.filter((def) => {
      // Skip City Hall
      if (def.id === 'city-hall') return false
      
      // Exclude specialized buildings (they're shown in dropdowns)
      if (def.requiresBaseBuilding && def.requiresBaseBuilding !== 'logging-station') return false
      
      // Exclude production-related buildings that don't require logging-station (they're shown in completed buildings)
      if (def.production && !def.requiresBaseBuilding) return false
      
      // Only show level-locked unique colony buildings
      if (def.levelRequired > skillLevel) return true
      
      return false
    })
  }

  const maxBuildingLimit = getMaxBuildingLimit(village.buildings)
  const totalBuildings = village.buildings.filter((b) => b.completed).length + village.constructionQueue.length
  
  // Check if logging station is built
  const hasLoggingStation = village.buildings.some((b) => b.type === 'logging-station' && b.completed)
  
  const canBuild = (definition: BuildingDefinition): boolean => {
    // Check level requirement
    if (definition.levelRequired > skillLevel) return false

    // Check if this building requires a base building
    if (definition.requiresBaseBuilding) {
      const hasBaseBuilding = village.buildings.some(
        (b) => b.type === definition.requiresBaseBuilding && b.completed
      )
      if (!hasBaseBuilding) return false
    }

    // Check if this is a main building - only allow one
    if (definition.unlocksSpecializedBuildings) {
      const existingMainBuilding = village.buildings.find((b) => b.type === definition.id && b.completed)
      if (existingMainBuilding) return false
    }

    // Check total building limit
    if (totalBuildings >= maxBuildingLimit) return false

    // Check construction queue limit (max 3)
    if (village.constructionQueue.length >= 3) return false

    const buildingCount = village.buildings.filter((b) => b.type === definition.id).length
    const cost = calcBuildingCost(definition.baseCost, buildingCount, definition.tier)
    return (
      village.resources.wood >= cost.wood &&
      village.resources.stone >= cost.stone
    )
  }

  const getConstructionProgress = (building: any) => {
    if (!building.constructionStartTime) return { progress: 0, remaining: 0 }
    const elapsed = currentTime - building.constructionStartTime
    const progress = Math.min((elapsed / building.constructionDuration) * 100, 100)
    const remaining = Math.max((building.constructionDuration - elapsed) / 1000, 0)
    return { progress, remaining }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const handleBuildClick = (buildingType: BuildingDefinition['id']) => {
    // Always try to start construction - the store will validate and show errors
    startBuildingConstruction(buildingType)
  }

  const handleAssignVillager = (villagerId: string, buildingId: string | null) => {
    assignVillagerToBuilding(villagerId, buildingId)
  }

  // Separate buildings by type for better organization
  // Food buildings (produce food resources for main inventory)
  const foodBuildings = village.buildings.filter((b) => {
    const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
    if (!def?.production) return false
    const resourceId = def.production.resource
    // Check if it's a food resource (from FOOD_RESOURCES)
    return ['apples', 'oranges', 'wheat', 'corn', 'potatoes', 'grapes', 'carrots', 'tomatoes', 
            'bananas', 'berries', 'cabbage', 'onions', 'peppers', 'mushrooms', 'cucumbers',
            'avocados', 'pumpkins', 'watermelons', 'pineapples', 'strawberries', 'peaches',
            'mangoes', 'kiwis', 'dragon-fruit', 'starfruit'].includes(resourceId)
  })
  
  // Herb buildings (produce herb resources for main inventory)
  const herbBuildings = village.buildings.filter((b) => {
    const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
    if (!def?.production) return false
    const resourceId = def.production.resource
    // Check if it's a herb resource (from HERB_RESOURCES)
    return ['medicinal-herbs', 'thyme', 'basil', 'oregano', 'rosemary', 'sage', 'mint',
            'lavender', 'chamomile', 'ginseng', 'echinacea', 'aloe-vera', 'ginseng-root',
            'valerian', 'st-johns-wort', 'turmeric', 'ginger', 'feverfew', 'milk-thistle',
            'ashwagandha', 'rhodiola', 'reishi', 'cordyceps', 'warp-herb', 'emperor-blessing'].includes(resourceId)
  })
  
  // Other production buildings (village resources)
  const otherProductionBuildings = village.buildings.filter((b) => {
    const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
    return def?.production && !def?.housingCapacity && 
           !foodBuildings.includes(b) && !herbBuildings.includes(b)
  })
  
  const housingBuildings = village.buildings.filter((b) => {
    const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
    return def?.housingCapacity
  })
  
  const otherBuildings = village.buildings.filter((b) => {
    const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
    return !def?.production && !def?.housingCapacity && b.type !== 'city-hall'
  })
  
  // City Hall (special handling)
  const cityHall = village.buildings.find((b) => b.type === 'city-hall' && b.completed)

  const availableBuildings = getAvailableBuildings()
  const lockedBuildings = getLockedBuildings()

  // Get buildings for selected dashboard
  const dashboardBuildings = selectedDashboard === 'food' 
    ? foodBuildings 
    : selectedDashboard === 'herb' 
    ? herbBuildings 
    : []

  return (
    <div className="colony-layout">
      {/* Sidebar Menu */}
      <div className="colony-sidebar-menu">
        <button
          className={`sidebar-menu-button ${selectedDashboard === 'food' ? 'active' : ''}`}
          onClick={() => setSelectedDashboard(selectedDashboard === 'food' ? 'none' : 'food')}
        >
          <span className="sidebar-menu-icon">🍎</span>
          <span className="sidebar-menu-label">Food</span>
        </button>
        <button
          className={`sidebar-menu-button ${selectedDashboard === 'herb' ? 'active' : ''}`}
          onClick={() => setSelectedDashboard(selectedDashboard === 'herb' ? 'none' : 'herb')}
        >
          <span className="sidebar-menu-icon">🌿</span>
          <span className="sidebar-menu-label">Herb</span>
        </button>
      </div>

      {/* Main Content Area */}
      {selectedDashboard === 'none' ? (
        <div className="colony-container">
          {/* Header */}
          <div className="colony-header">
            <h1 className="colony-title">🏘️ Colony Management</h1>
            <p className="colony-subtitle">Build and manage your settlement</p>
          </div>

          {/* Resources Panel */}
          <div className="colony-resources-panel">
        <div className="resource-item">
          <span className="resource-icon">🪵</span>
          <span className="resource-label">Wood:</span>
          <span className="resource-value">{village.resources.wood} / {village.storageCapacity.wood}</span>
        </div>
        <div className="resource-item">
          <span className="resource-icon">⛏️</span>
          <span className="resource-label">Stone:</span>
          <span className="resource-value">{village.resources.stone} / {village.storageCapacity.stone}</span>
        </div>
        <div className="resource-item">
          <span className="resource-icon">🌾</span>
          <span className="resource-label">Food:</span>
          <span className="resource-value">{village.resources.food} / {village.storageCapacity.food}</span>
        </div>
        <div className="resource-item">
          <span className="resource-icon">🌿</span>
          <span className="resource-label">Herbs:</span>
          <span className="resource-value">{village.resources.herbs} / {village.storageCapacity.herbs}</span>
        </div>
        <div className="resource-item">
          <span className="resource-icon">👷</span>
          <span className="resource-label">Workers:</span>
          <span className="resource-value">
            {village.villagers.filter((v) => !v.assignedBuilding).length} / {village.villagers.length}
          </span>
        </div>
      </div>


      {/* Construction Queue - Fixed Position */}
      {village.constructionQueue.length > 0 && (
        <div className="colony-construction-queue fixed-queue">
          <h2 className="section-title">CONSTRUCTION QUEUE ({village.constructionQueue.length}/3)</h2>
          <div className="construction-queue-list">
            {village.constructionQueue.map((building) => {
              const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
              const progress = getConstructionProgress(building)
              return (
                <div key={building.id} className="construction-item">
                  <div className="construction-info">
                    <span className="construction-icon">{definition?.icon}</span>
                    <span className="construction-name">{definition?.name}</span>
                  </div>
                  <div className="construction-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{formatTime(progress.remaining)} remaining</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Buildings Section */}
      <div className="colony-buildings-section">
        <h2 className="section-title">AVAILABLE BUILDINGS</h2>
        <div className="buildings-grid">
          {availableBuildings
            .filter((def) => {
              // Show all buildings that don't require specialized base buildings (food-field/herb-field)
              // Buildings requiring logging-station should still show
              return !def.requiresBaseBuilding || def.requiresBaseBuilding === 'logging-station'
            })
            .map((definition) => {
              const buildingCount = village.buildings.filter((b) => b.type === definition.id).length
              const hasCompletedBuilding = village.buildings.some(
                (b) => b.type === definition.id && b.completed
              )
              const cost = calcBuildingCost(definition.baseCost, buildingCount, definition.tier)
              const canBuildThis = canBuild(definition)
              const constructionTime = (cost.wood * 30 + cost.stone * 45) * 1000
              const specializedBuildings = definition.unlocksSpecializedBuildings
                ? BUILDING_DEFINITIONS.filter((d) =>
                    definition.unlocksSpecializedBuildings!.includes(d.id)
                  )
                : []

              // Check if building requires logging station and it's not built
              const requiresLoggingStation = definition.requiresBaseBuilding === 'logging-station'
              const isLockedByLoggingStation = requiresLoggingStation && !hasLoggingStation
              
              return (
                <div key={definition.id} className="building-card-wrapper">
                  <div
                    className={`building-card ${canBuildThis ? 'available' : isLockedByLoggingStation ? 'locked' : 'disabled'}`}
                    onClick={() => canBuildThis && handleBuildClick(definition.id)}
                  >
                    <div className="building-header">
                      <span className="building-icon">{isLockedByLoggingStation ? '🔒' : definition.icon}</span>
                      <span className="building-name">{definition.name}</span>
                    </div>
                    <div className="building-description">{definition.description}</div>
                    {isLockedByLoggingStation ? (
                      <div className="building-level" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                        Requires Logging Station
                      </div>
                    ) : (
                      <>
                        <div className="building-cost">
                          <span>🪵 {cost.wood}</span>
                          {cost.stone > 0 && <span>⛏️ {cost.stone}</span>}
                        </div>
                        <div className="building-time">⏱️ {formatTime(constructionTime / 1000)}</div>
                        <div className="building-level">Level {definition.levelRequired} Required</div>
                        {buildingCount > 0 && <div className="building-count">Built: {buildingCount}</div>}
                        {hasCompletedBuilding && specializedBuildings.length > 0 && (
                          <div className="building-unlocks">
                            Unlocks {specializedBuildings.length} specialized buildings
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Dropdown for specialized buildings */}
                  {hasCompletedBuilding && specializedBuildings.length > 0 && (
                    <div className="specialized-buildings-dropdown">
                      <div className="specialized-buildings-header">
                        <span>Specialized Buildings:</span>
                      </div>
                      <div className="specialized-buildings-grid">
                        {specializedBuildings.map((specDef) => {
                          const specBuildingCount = village.buildings.filter(
                            (b) => b.type === specDef.id
                          ).length
                          const specCost = calcBuildingCost(
                            specDef.baseCost,
                            specBuildingCount,
                            specDef.tier
                          )
                          const canBuildSpec = canBuild(specDef)
                          const specConstructionTime =
                            (specCost.wood * 30 + specCost.stone * 45) * 1000

                          return (
                            <div
                              key={specDef.id}
                              className={`specialized-building-card ${canBuildSpec ? 'available' : 'disabled'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (canBuildSpec) handleBuildClick(specDef.id)
                              }}
                            >
                              <div className="specialized-building-header">
                                <span className="specialized-building-icon">{specDef.icon}</span>
                                <span className="specialized-building-name">{specDef.name}</span>
                              </div>
                              <div className="specialized-building-description">
                                {specDef.description}
                              </div>
                              <div className="specialized-building-cost">
                                <span>🪵 {specCost.wood}</span>
                                {specCost.stone > 0 && <span>⛏️ {specCost.stone}</span>}
                              </div>
                              <div className="specialized-building-level">
                                Level {specDef.levelRequired} Required
                              </div>
                              {specBuildingCount > 0 && (
                                <div className="specialized-building-count">
                                  Built: {specBuildingCount}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {lockedBuildings.length > 0 && (
          <>
            <h2 className="section-title locked-buildings-title">LOCKED BUILDINGS</h2>
            <div className="buildings-grid">
              {lockedBuildings.map((definition) => (
                <div key={definition.id} className="building-card locked">
                  <div className="building-header">
                    <span className="building-icon">🔒</span>
                    <span className="building-name">{definition.name}</span>
                  </div>
                  <div className="building-level">Level {definition.levelRequired} Required</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

          {/* Completed Buildings List */}
          {village.buildings.length > 0 && (
            <div className="colony-buildings-list">
              <h2 className="section-title">COMPLETED BUILDINGS ({village.buildings.length})</h2>
              
              {/* City Hall */}
              {cityHall && (
                <>
                  <h3 className="subsection-title">City Hall</h3>
                  <div className="buildings-list">
                    <div className="building-list-item completed">
                      <div className="building-list-info">
                        <span className="building-list-icon">🏛️</span>
                        <div className="building-list-details">
                          <div className="building-name-row">
                            <span className="building-list-name">City Hall</span>
                            <span className="building-status-complete">✓ Completed</span>
                          </div>
                          <span className="building-list-level">Level {cityHall.level}</span>
                          <span className="building-list-description">
                            Building Limit: {maxBuildingLimit} ({totalBuildings}/{maxBuildingLimit} used)
                          </span>
                        </div>
                      </div>
                      <button
                        className="upgrade-button"
                        onClick={() => upgradeBuilding(cityHall.id)}
                      >
                        Upgrade (🪵 {cityHall.level * 50}{cityHall.level >= 3 ? ` ⛏️ ${cityHall.level * 30}` : ''})
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Other Production Buildings */}
              {otherProductionBuildings.length > 0 && (
                <>
                  <h3 className="subsection-title">Production Buildings</h3>
                  <div className="buildings-list">
                    {otherProductionBuildings.map((building) => {
                      const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
                      const assignedVillagers = village.villagers.filter((v) =>
                        building.assignedVillagers.includes(v.id)
                      )
                      const isMainBuilding = definition?.unlocksSpecializedBuildings
                      const specializedBuildings = isMainBuilding
                        ? BUILDING_DEFINITIONS.filter((d) =>
                            definition.unlocksSpecializedBuildings!.includes(d.id)
                          )
                        : []
                      const isExpanded = expandedSpecialized.has(building.id)

                      return (
                        <div key={building.id}>
                          <div className="building-list-item completed">
                            <div className="building-list-info">
                              <span className="building-list-icon">{definition?.icon}</span>
                              <div className="building-list-details">
                                <div className="building-name-row">
                                  <span className="building-list-name">{definition?.name}</span>
                                  <span className="building-status-complete">✓ Completed</span>
                                </div>
                                <span className="building-list-level">Level {building.level}</span>
                              </div>
                            </div>
                            {definition?.housingCapacity && (
                              <div className="building-housing">
                                Houses {definition.housingCapacity} villager{definition.housingCapacity > 1 ? 's' : ''}
                              </div>
                            )}
                            {definition?.production && (
                              <div className="building-production">
                                <div className="production-info">
                                  <span className="production-rate">
                                    {definition.production.rate} {definition.production.resource}/hour
                                  </span>
                                  <div className="production-resources-ready">
                                    Ready: {Math.floor(building.accumulatedResources || 0)} / {definition.production.storageCapacity}
                                  </div>
                                  <div className="production-workers-assignment">
                                <span className="production-workers">
                                  Workers: {assignedVillagers.length}/{getMaxWorkersForLevel(definition.maxWorkers, building.level)}
                                </span>
                                {building.assignedVillagers.length < getMaxWorkersForLevel(definition.maxWorkers, building.level) &&
                                      village.villagers.filter((v) => !v.assignedBuilding).length > 0 && (
                                        <button
                                          className="assign-worker-button"
                                          onClick={() => {
                                            const unassignedWorker = village.villagers.find(
                                              (v) => !v.assignedBuilding
                                            )
                                            if (unassignedWorker) {
                                              handleAssignVillager(unassignedWorker.id, building.id)
                                            }
                                          }}
                                          title="Assign an unassigned worker"
                                        >
                                          Assign Worker
                                        </button>
                                      )}
                                    {assignedVillagers.length > 0 && (
                                      <button
                                        className="unassign-worker-button"
                                        onClick={() => {
                                          const firstAssigned = village.villagers.find(
                                            (v) => v.assignedBuilding === building.id
                                          )
                                          if (firstAssigned) {
                                            handleAssignVillager(firstAssigned.id, null)
                                          }
                                        }}
                                        title="Unassign worker"
                                      >
                                        Unassign
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <button
                                  className="collect-button"
                                  onClick={() => collectBuildingResources(building.id)}
                                  disabled={assignedVillagers.length === 0 || (building.accumulatedResources || 0) <= 0}
                                  title={
                                    assignedVillagers.length === 0
                                      ? 'Assign workers to produce resources'
                                      : (building.accumulatedResources || 0) <= 0
                                      ? 'No resources ready yet'
                                      : 'Collect resources'
                                  }
                                >
                                  Collect ({Math.floor(building.accumulatedResources || 0)})
                                </button>
                              </div>
                            )}
                            {isMainBuilding && specializedBuildings.length > 0 && (
                              <button
                                className="toggle-specialized-button"
                                onClick={() => toggleSpecialized(building.id)}
                              >
                                {isExpanded ? '−' : '+'} Specialized Buildings ({specializedBuildings.length})
                              </button>
                            )}
                          </div>
                          {/* Specialized Buildings Dropdown */}
                          {isMainBuilding && isExpanded && specializedBuildings.length > 0 && (
                            <div className="specialized-buildings-dropdown">
                              <div className="specialized-buildings-header">
                                <span>Specialized Buildings:</span>
                              </div>
                              <div className="specialized-buildings-grid">
                                {specializedBuildings.map((specDef) => {
                                  const specBuildingCount = village.buildings.filter(
                                    (b) => b.type === specDef.id
                                  ).length
                                  const specCost = calcBuildingCost(
                                    specDef.baseCost,
                                    specBuildingCount,
                                    specDef.tier
                                  )
                                  const canBuildSpec = canBuild(specDef)
                                  const specConstructionTime =
                                    (specCost.wood * 30 + specCost.stone * 45) * 1000

                                  return (
                                    <div
                                      key={specDef.id}
                                      className={`specialized-building-card ${canBuildSpec ? 'available' : 'disabled'}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleBuildClick(specDef.id)
                                      }}
                                    >
                                      <div className="specialized-building-header">
                                        <span className="specialized-building-icon">{specDef.icon}</span>
                                        <span className="specialized-building-name">{specDef.name}</span>
                                      </div>
                                      <div className="specialized-building-description">
                                        {specDef.description}
                                      </div>
                                      <div className="specialized-building-cost">
                                        <span>🪵 {specCost.wood}</span>
                                        {specCost.stone > 0 && <span>⛏️ {specCost.stone}</span>}
                                      </div>
                                      <div className="specialized-building-level">
                                        Level {specDef.levelRequired} Required
                                      </div>
                                      {specBuildingCount > 0 && (
                                        <div className="specialized-building-count">
                                          Built: {specBuildingCount}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Housing Buildings */}
              {housingBuildings.length > 0 && (
                <>
                  <h3 className="subsection-title">Housing ({housingBuildings.reduce((sum, b) => {
                    const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
                    return sum + (def?.housingCapacity || 0)
                  }, 0)} capacity)</h3>
                  <div className="buildings-list">
                    {housingBuildings.map((building) => {
                      const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
                      return (
                        <div key={building.id} className="building-list-item completed">
                          <div className="building-list-info">
                            <span className="building-list-icon">{definition?.icon}</span>
                            <div className="building-list-details">
                              <div className="building-name-row">
                                <span className="building-list-name">{definition?.name}</span>
                                <span className="building-status-complete">✓ Completed</span>
                              </div>
                              <span className="building-list-level">Level {building.level}</span>
                            </div>
                          </div>
                          {definition?.housingCapacity && (
                            <div className="building-housing">
                              Houses {definition.housingCapacity} villager{definition.housingCapacity > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Other Buildings */}
              {otherBuildings.length > 0 && (
                <>
                  <h3 className="subsection-title">Other Buildings</h3>
                  <div className="buildings-list">
                    {otherBuildings.map((building) => {
                      const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
                      return (
                        <div key={building.id} className="building-list-item completed">
                          <div className="building-list-info">
                            <span className="building-list-icon">{definition?.icon}</span>
                            <div className="building-list-details">
                              <div className="building-name-row">
                                <span className="building-list-name">{definition?.name}</span>
                                <span className="building-status-complete">✓ Completed</span>
                              </div>
                              <span className="building-list-level">Level {building.level}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="colony-dashboard">
          <div className="dashboard-header">
            <h2 className="dashboard-title">
              {selectedDashboard === 'food' ? '🍎 Food Production' : '🌿 Herb Production'}
            </h2>
            <button
              className="dashboard-close-button"
              onClick={() => setSelectedDashboard('none')}
            >
              ✕
            </button>
          </div>
          {dashboardBuildings.length === 0 ? (
            <div className="dashboard-empty">
              <p>No {selectedDashboard === 'food' ? 'food' : 'herb'} production buildings built yet.</p>
              <p>Build a {selectedDashboard === 'food' ? 'Food Field' : 'Herb Field'} to get started!</p>
            </div>
          ) : (
            <div className="dashboard-buildings-grid">
              {dashboardBuildings.map((building) => {
                const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
                const assignedVillagers = village.villagers.filter((v) =>
                  building.assignedVillagers.includes(v.id)
                )

                const maxWorkers = definition ? getMaxWorkersForLevel(definition.maxWorkers, building.level) : 0
                const baseRate = definition?.production?.rate || 0
                const effectiveRate = calculateEffectiveProductionRate(
                  baseRate,
                  building.level,
                  assignedVillagers,
                  assignedVillagers.length
                )
                const upgradeCost = definition ? calculateProductionBuildingUpgradeCost(definition.baseCost, building.level) : { wood: 0, stone: 0 }
                const canAffordUpgrade = village.resources.wood >= upgradeCost.wood && village.resources.stone >= upgradeCost.stone

                return (
                  <div key={building.id} className="dashboard-building-card">
                    <div className="dashboard-building-header">
                      <span className="dashboard-building-icon">{definition?.icon}</span>
                      <span className="dashboard-building-name">{definition?.name}</span>
                    </div>
                    <div className="dashboard-building-level">Level {building.level}</div>
                    {definition?.production && (
                      <div className="dashboard-building-production">
                        <div className="dashboard-production-rate">
                          Effective: {effectiveRate.toFixed(1)} {definition.production.resource}/hour
                          <span className="dashboard-production-base" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '0.25rem' }}>
                            Base: {baseRate}/h × {getProductionRateMultiplier(building.level).toFixed(2)}x (level) × {getWorkerScalingMultiplier(assignedVillagers.length).toFixed(2)}x (workers)
                          </span>
                        </div>
                        <div className="dashboard-production-ready">
                          Ready: {Math.floor(building.accumulatedResources || 0)} / {definition.production.storageCapacity}
                        </div>
                        <div className="dashboard-production-workers">
                          Workers: {assignedVillagers.length}/{maxWorkers}
                        </div>
                        <div className="dashboard-production-actions">
                          {building.assignedVillagers.length < maxWorkers &&
                            village.villagers.filter((v) => !v.assignedBuilding).length > 0 && (
                              <button
                                className="dashboard-assign-button"
                                onClick={() => {
                                  const unassignedWorker = village.villagers.find(
                                    (v) => !v.assignedBuilding
                                  )
                                  if (unassignedWorker) {
                                    handleAssignVillager(unassignedWorker.id, building.id)
                                  }
                                }}
                              >
                                Assign Worker
                              </button>
                            )}
                          {assignedVillagers.length > 0 && (
                            <button
                              className="dashboard-unassign-button"
                              onClick={() => {
                                const firstAssigned = village.villagers.find(
                                  (v) => v.assignedBuilding === building.id
                                )
                                if (firstAssigned) {
                                  handleAssignVillager(firstAssigned.id, null)
                                }
                              }}
                            >
                              Unassign
                            </button>
                          )}
                        </div>
                        <button
                          className="dashboard-collect-button"
                          onClick={() => collectBuildingResources(building.id)}
                          disabled={assignedVillagers.length === 0 || (building.accumulatedResources || 0) <= 0}
                        >
                          Collect ({Math.floor(building.accumulatedResources || 0)})
                        </button>
                        <button
                          className="dashboard-upgrade-button"
                          onClick={() => upgradeBuilding(building.id)}
                          disabled={!canAffordUpgrade}
                          title={!canAffordUpgrade ? `Need ${upgradeCost.wood} wood, ${upgradeCost.stone} stone` : `Upgrade to Level ${building.level + 1}`}
                        >
                          Upgrade (🪵 {upgradeCost.wood} ⛏️ {upgradeCost.stone})
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

