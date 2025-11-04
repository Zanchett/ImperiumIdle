import { useEffect, useState } from 'react'
import { Skill } from '../types/skills'
import { SALVAGING_RESOURCES, SalvagingResource } from '../types/salvagingResources'
import { SMELTING_RECIPES, SmeltingRecipe } from '../types/smeltingResources'
import { ENGINEERING_RECIPES, EngineeringRecipe } from '../types/engineeringResources'
import { useGameStore } from '../stores/gameStore'
import { getSpeedBonus, getGatherLimitIncrease } from '../utils/veterancy'
import CombatDashboard from './CombatDashboard'
import DungeonSelector from './DungeonSelector'
import Communication from './Communication'
import Commerce from './Commerce'
import Colony from './Colony'
import { Enemy } from '../types/enemies'
import './MainContent.css'

interface MainContentProps {
  skill: Skill | null
}

const BASE_MAX_GATHERS_PER_RESOURCE = 10

export default function MainContent({ skill }: MainContentProps) {
  const {
    startSalvaging,
    stopSalvaging,
    activeSalvagingTasks,
    resourceRespawns,
    resourceGatherCounts,
    setAutoResume,
    startSmelting,
    stopSmelting,
    activeSmeltingTasks,
    startEngineering,
    stopEngineering,
    activeEngineeringTasks,
    resources,
    resourceVeterancies,
    skillVeterancies,
  } = useGameStore()

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [showVeterancyPopup, setShowVeterancyPopup] = useState(false)
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null)
  const [combatActive, setCombatActive] = useState(false)
  const [selectedMetalTab, setSelectedMetalTab] = useState<string | null>(null) // For engineering tab filtering
  const [hoveredRecipe, setHoveredRecipe] = useState<EngineeringRecipe | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  // Update time every second to refresh timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100) // Update every 100ms for smoother progress

    return () => clearInterval(interval)
  }, [])

  // Determine skill types (do this early, before any early returns)
  const isSalvaging = skill?.id === 'salvaging'
  const isSmelting = skill?.id === 'smelting'
  const isEngineering = skill?.id === 'engineering'
  const isCombat = skill?.id === 'bolter-training' || skill?.id === 'melee-combat'
  const isCommunication = skill?.id === 'communication'
  const isCommerce = skill?.id === 'commerce'
  const isColony = skill?.id === 'colony'

  // For engineering, get unique metal types from recipes
  const getMetalTypes = () => {
    if (!isEngineering) return []
    const metalTypes = new Set<string>()
    ENGINEERING_RECIPES.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        if (ing.resourceId.includes('placeholder-metal-')) {
          const metalMatch = ing.resourceId.match(/placeholder-metal-(\d+)/)
          if (metalMatch) {
            metalTypes.add(metalMatch[1])
          }
        }
      })
    })
    return Array.from(metalTypes).sort((a, b) => parseInt(a) - parseInt(b))
  }

  const metalTypes = isEngineering ? getMetalTypes() : []
  
  // Set default tab on mount if engineering and no tab selected
  // IMPORTANT: This hook must be called BEFORE any early returns
  useEffect(() => {
    if (isEngineering && !selectedMetalTab && metalTypes.length > 0) {
      setSelectedMetalTab(metalTypes[0])
    }
  }, [isEngineering, selectedMetalTab]) // Only re-run when engineering state changes

  // Note: Gathering logic is handled by BackgroundGathering component
  // This component only handles UI display

  const handleResourceClick = (resource: SalvagingResource) => {
    // Check if resource is on respawn cooldown
    const respawn = resourceRespawns.find((r) => r.resourceId === resource.id)
    if (respawn && currentTime < respawn.respawnTime) {
      return // Resource is still respawning, can't click
    }

    // Check if already salvaging this resource
    const activeTask = activeSalvagingTasks.find((t) => t.resourceId === resource.id && !t.completed)
    const gatherCount = resourceGatherCounts.find((g) => g.resourceId === resource.id)
    const isActive = activeTask || gatherCount?.autoResume

    if (isActive) {
      // Stop salvaging this resource
      stopSalvaging(resource.id)
    } else {
      // Stop ALL other active salvaging first (both active tasks and auto-resume)
      resourceGatherCounts.forEach((gc) => {
        if (gc.autoResume) {
          stopSalvaging(gc.resourceId)
        }
      })
      
      // Also cancel any active tasks from other resources
      activeSalvagingTasks.forEach((task) => {
        if (task.resourceId !== resource.id && !task.completed) {
          stopSalvaging(task.resourceId)
        }
      })

      // Stop ALL smelting activities
      activeSmeltingTasks.forEach((task) => {
        if (!task.completed) {
          stopSmelting(task.recipeId)
        }
      })

      // Ensure auto-resume is set BEFORE starting (creates entry if needed)
      setAutoResume(resource.id, true)
      
      // Apply speed bonus from skill veterancy
      const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'salvaging')
      const skillVeterancyLevel = skillVeterancy?.level || 0
      const speedBonus = getSpeedBonus(skillVeterancyLevel)
      const baseDuration = resource.baseTime * 1000
      const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
      
      // Start salvaging this resource
      startSalvaging(resource.id, duration)
    }
  }

  const getTaskProgress = (task: any) => {
    const elapsed = currentTime - task.startTime
    const progress = Math.min((elapsed / task.duration) * 100, 100)
    const remaining = Math.max((task.duration - elapsed) / 1000, 0)
    return { progress, remaining }
  }

  const isResourceOnCooldown = (resource: SalvagingResource) => {
    const respawn = resourceRespawns.find((r) => r.resourceId === resource.id)
    return respawn && currentTime < respawn.respawnTime
  }

  const getRespawnTimeRemaining = (resourceId: string) => {
    const respawn = resourceRespawns.find((r) => r.resourceId === resourceId)
    if (!respawn) return 0
    const remaining = Math.max((respawn.respawnTime - currentTime) / 1000, 0)
    return remaining
  }

  const getGatherCount = (resourceId: string) => {
    const gatherCount = resourceGatherCounts.find((g) => g.resourceId === resourceId)
    return gatherCount?.count || 0
  }

  const isResourceActive = (resourceId: string) => {
    const activeTask = activeSalvagingTasks.find((t) => t.resourceId === resourceId && !t.completed)
    const gatherCount = resourceGatherCounts.find((g) => g.resourceId === resourceId)
    return !!(activeTask || gatherCount?.autoResume)
  }

  if (!skill) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <h2>NO PROTOCOL SELECTED</h2>
          <p>Select a protocol from the sidebar to view details</p>
        </div>
      </div>
    )
  }

  // For combat skills, show dungeon selector instead of normal header
  // IMPORTANT: Early return AFTER all hooks have been called
  if (isCombat && skill) {
    return (
      <div className="main-content">
        <div className="combat-skill-content">
          <DungeonSelector
            onEnemySelect={(enemy) => {
              setSelectedEnemy(enemy)
              setCombatActive(false)
            }}
            onStartCombat={() => {
              if (selectedEnemy) {
                setCombatActive(true)
              }
            }}
            onStopCombat={() => setCombatActive(false)}
            selectedEnemy={selectedEnemy}
            combatActive={combatActive}
          />
          <CombatDashboard
            skillId={skill.id}
            selectedEnemy={selectedEnemy}
            combatActive={combatActive}
            onCombatStop={() => setCombatActive(false)}
          />
        </div>
      </div>
    )
  }

  // Render Communication skill
  if (isCommunication && skill) {
    return <Communication skillId={skill.id} />
  }

  // Render Commerce skill
  if (isCommerce && skill) {
    return <Commerce skillId={skill.id} />
  }

  // Render Colony skill
  if (isColony && skill) {
    return <Colony skillId={skill.id} />
  }
  
  const availableResources = isSalvaging
    ? SALVAGING_RESOURCES.filter((resource) => resource.levelRequired <= skill.level)
    : []

  const lockedResources = isSalvaging
    ? SALVAGING_RESOURCES.filter((resource) => resource.levelRequired > skill.level)
    : []

  const filterRecipesByMetal = (recipes: EngineeringRecipe[]) => {
    if (!isEngineering || !selectedMetalTab) return recipes
    return recipes.filter((recipe) => {
      return recipe.ingredients.some((ing) => {
        if (ing.resourceId.includes('placeholder-metal-')) {
          const metalMatch = ing.resourceId.match(/placeholder-metal-(\d+)/)
          return metalMatch && metalMatch[1] === selectedMetalTab
        }
        return false
      })
    })
  }

  const availableRecipes = isSmelting
    ? SMELTING_RECIPES.filter((recipe) => recipe.levelRequired <= skill.level)
    : isEngineering
    ? filterRecipesByMetal(ENGINEERING_RECIPES.filter((recipe) => recipe.levelRequired <= skill.level))
    : []

  const lockedRecipes = isSmelting
    ? SMELTING_RECIPES.filter((recipe) => recipe.levelRequired > skill.level)
    : isEngineering
    ? filterRecipesByMetal(ENGINEERING_RECIPES.filter((recipe) => recipe.levelRequired > skill.level))
    : []

  const canCraftRecipe = (recipe: SmeltingRecipe | EngineeringRecipe) => {
    return recipe.ingredients.every(
      (ingredient) => (resources[ingredient.resourceId] || 0) >= ingredient.amount
    )
  }

  const handleRecipeClick = (recipe: SmeltingRecipe | EngineeringRecipe) => {
    const isEngineeringRecipe = isEngineering && ENGINEERING_RECIPES.some((r) => r.id === recipe.id)
    
    const activeSmeltingTask = activeSmeltingTasks.find((t) => t.recipeId === recipe.id && !t.completed)
    const activeEngineeringTask = activeEngineeringTasks.find((t) => t.recipeId === recipe.id && !t.completed)
    const isActive = !!activeSmeltingTask || !!activeEngineeringTask

    if (isActive) {
      // Stop the active task
      if (isEngineeringRecipe) {
        stopEngineering(recipe.id)
      } else {
        stopSmelting(recipe.id)
      }
    } else {
      // Check if we have ingredients
      if (!canCraftRecipe(recipe)) {
        return // Can't craft without ingredients
      }

      // Stop ALL other active tasks first
      if (isEngineeringRecipe) {
        // Stop ALL other engineering tasks
        activeEngineeringTasks.forEach((task) => {
          if (task.recipeId !== recipe.id && !task.completed) {
            stopEngineering(task.recipeId)
          }
        })
      } else {
        // Stop ALL other smelting tasks
        activeSmeltingTasks.forEach((task) => {
          if (task.recipeId !== recipe.id && !task.completed) {
            stopSmelting(task.recipeId)
          }
        })
      }

      // Stop ALL other skill activities
      if (!isEngineeringRecipe) {
        activeEngineeringTasks.forEach((task) => {
          if (!task.completed) {
            stopEngineering(task.recipeId)
          }
        })
      }
      if (!isSmelting) {
        activeSmeltingTasks.forEach((task) => {
          if (!task.completed) {
            stopSmelting(task.recipeId)
          }
        })
      }

      // Stop ALL salvaging activities
      resourceGatherCounts.forEach((gc) => {
        if (gc.autoResume) {
          stopSalvaging(gc.resourceId)
        }
      })
      
      activeSalvagingTasks.forEach((task) => {
        if (!task.completed) {
          stopSalvaging(task.resourceId)
        }
      })

      // Apply speed bonus from skill veterancy
      const skillId = isEngineeringRecipe ? 'engineering' : 'smelting'
      const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === skillId)
      const skillVeterancyLevel = skillVeterancy?.level || 0
      const speedBonus = getSpeedBonus(skillVeterancyLevel)
      const baseDuration = recipe.time * 1000
      const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
      
      // Start crafting this recipe
      if (isEngineeringRecipe) {
        startEngineering(recipe.id, duration, true) // Auto-resume enabled
      } else {
        startSmelting(recipe.id, duration, true) // Auto-resume enabled
      }
    }
  }

  const getCraftingProgress = (task: any) => {
    const elapsed = currentTime - task.startTime
    const progress = Math.min((elapsed / task.duration) * 100, 100)
    const remaining = Math.max((task.duration - elapsed) / 1000, 0)
    return { progress, remaining }
  }

  const handleRecipeMouseEnter = (e: React.MouseEvent, recipe: EngineeringRecipe) => {
    if (isEngineering && recipe.equipmentStats) {
      setHoveredRecipe(recipe)
      setHoverPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleRecipeMouseLeave = () => {
    setHoveredRecipe(null)
  }

  const renderRecipeCard = (recipe: SmeltingRecipe | EngineeringRecipe, isLocked: boolean) => {
    if (isLocked) {
      return (
        <div key={recipe.id} className="resource-card locked">
          <div className="resource-header">
            <div className="resource-icon-locked">?</div>
            <div className="resource-name">Locked</div>
          </div>
          <div className="resource-level-req">
            Level {recipe.levelRequired} Required
          </div>
          <div className="resource-bottom-progress"></div>
        </div>
      )
    }

    const activeSmeltingTask = activeSmeltingTasks.find((t) => t.recipeId === recipe.id && !t.completed)
    const activeEngineeringTask = activeEngineeringTasks.find((t) => t.recipeId === recipe.id && !t.completed)
    const activeTask = activeSmeltingTask || activeEngineeringTask
    const canCraft = canCraftRecipe(recipe)
    // Only show progress if task is active AND we still have ingredients
    const taskProgress = activeTask && canCraft ? getCraftingProgress(activeTask) : null
    const isActive = !!activeTask && canCraft
    const hasResult = (resources[recipe.id] || 0) > 0
    const isEngineeringRecipe = isEngineering && ENGINEERING_RECIPES.some((r) => r.id === recipe.id)

    return (
      <div
        key={recipe.id}
        className={`resource-card available ${isActive ? 'active' : ''} ${!canCraft ? 'disabled' : ''}`}
        onClick={() => canCraft && handleRecipeClick(recipe)}
        onMouseEnter={(e) => isEngineeringRecipe && handleRecipeMouseEnter(e, recipe as EngineeringRecipe)}
        onMouseLeave={handleRecipeMouseLeave}
        onMouseMove={(e) => {
          if (hoveredRecipe && hoveredRecipe.id === recipe.id) {
            setHoverPosition({ x: e.clientX, y: e.clientY })
          }
        }}
      >
        {/* Header: Icon + Name on left, Duration on right */}
        <div className="resource-header">
          <div className="resource-header-left">
            <span className="resource-header-icon">{recipe.icon || '⚙️'}</span>
            <span className="resource-name">{recipe.name}</span>
          </div>
          <span className="resource-duration">{recipe.time}s</span>
        </div>

        {/* Central Icon */}
        <div className="resource-icon-center">
          <span className="resource-large-icon">{recipe.icon || '⚙️'}</span>
        </div>

        {/* XP Text Below Icon */}
        <div className="resource-xp">
          {recipe.xpReward} XP
        </div>

        {/* Result Count */}
        {hasResult && (
          <div className="resource-count">
            {(resources[recipe.id] || 0).toLocaleString()}
          </div>
        )}

        {/* Ingredients */}
        <div className="recipe-ingredients">
          {recipe.ingredients.map((ingredient, idx) => {
            const hasIngredient = (resources[ingredient.resourceId] || 0) >= ingredient.amount
            const resource = SALVAGING_RESOURCES.find((r) => r.id === ingredient.resourceId)
            return (
              <div key={idx} className={`ingredient-item ${hasIngredient ? '' : 'missing'}`}>
                <span>{resource?.icon || '⚙️'}</span>
                <span>{ingredient.amount}x</span>
              </div>
            )
          })}
        </div>

        {/* Subtle bottom progress bar */}
        <div className="resource-bottom-progress">
          {activeTask && taskProgress && (
            <div
              className="resource-bottom-progress-fill"
              style={{ width: `${taskProgress.progress}%` }}
            ></div>
          )}
        </div>
      </div>
    )
  }

  const renderResourceCard = (resource: SalvagingResource, isLocked: boolean) => {
    if (isLocked) {
      return (
        <div key={resource.id} className="resource-card locked">
          <div className="resource-header">
            <div className="resource-icon-locked">?</div>
            <div className="resource-name">Locked</div>
          </div>
          <div className="resource-level-req">
            Level {resource.levelRequired} Required
          </div>
          <div className="resource-bottom-progress"></div>
        </div>
      )
    }

    const activeTask = activeSalvagingTasks.find((t) => t.resourceId === resource.id && !t.completed)
    const respawnRemaining = getRespawnTimeRemaining(resource.id)
    const taskProgress = activeTask ? getTaskProgress(activeTask) : null
    const gatherCount = getGatherCount(resource.id)
    const isActive = isResourceActive(resource.id)
    const onCooldown = isResourceOnCooldown(resource)
    
    // Calculate max gathers with veterancy bonus
    const resourceVeterancy = resourceVeterancies.find((rv) => rv.resourceId === resource.id)
    const veterancyLevel = resourceVeterancy?.level || 0
    const gatherLimitBonus = getGatherLimitIncrease(veterancyLevel)
    const maxGathers = BASE_MAX_GATHERS_PER_RESOURCE + gatherLimitBonus
    // This variable name is just for progress calculation, not related to veterancy

    return (
      <div
        key={resource.id}
        className={`resource-card available ${isActive ? 'active' : ''} ${onCooldown ? 'cooldown' : ''}`}
        onClick={() => !onCooldown && handleResourceClick(resource)}
      >
        {/* Header: Icon + Name on left, Duration on right */}
        <div className="resource-header">
          <div className="resource-header-left">
            <span className="resource-header-icon">{resource.icon || '⚙️'}</span>
            <div className="resource-name-wrapper">
              <span className="resource-name">{resource.name}</span>
            </div>
          </div>
          <span className="resource-duration">{resource.baseTime}s</span>
        </div>

        {/* Cooldown Timer */}
        {onCooldown && respawnRemaining > 0 && (
          <div className="resource-cooldown-timer">
            <span className="cooldown-label">Available in:</span>
            <span className="cooldown-time">
              {Math.ceil(respawnRemaining)}s
            </span>
          </div>
        )}

        {/* Central Icon */}
        <div className="resource-icon-center">
          <span className="resource-large-icon">{resource.icon || '⚙️'}</span>
        </div>

        {/* XP Text Below Icon */}
        <div className="resource-xp">
          {resource.xpReward} XP
        </div>

        {/* Gather Count (Remaining) */}
        <div className="resource-count">
          {maxGathers - gatherCount} / {maxGathers}
        </div>

        {/* Resource Veterancy Bar - Compact design */}
        <div className="resource-veterancy">
          <div className="resource-veterancy-row">
            <div className="resource-veterancy-icon">🏆</div>
            <div className="resource-veterancy-progress-wrapper">
              <div className="resource-veterancy-progress-bar">
                <div
                  className="resource-veterancy-progress-fill"
                  style={{
                    width: `${resourceVeterancy 
                      ? Math.min(100, Math.max(0, ((resourceVeterancy.experience || 0) / Math.max(1, resourceVeterancy.experienceToNext || 1)) * 100))
                      : 0}%`,
                  }}
                ></div>
              </div>
              <div className="resource-veterancy-text">
                <span className="resource-veterancy-level">V{resourceVeterancy?.level || 0}</span>
                <span className="resource-veterancy-xp">
                  {(resourceVeterancy?.experience || 0).toLocaleString()} / {(resourceVeterancy?.experienceToNext || 1).toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle bottom progress bar */}
        <div className="resource-bottom-progress">
          {activeTask && taskProgress && (
            <div
              className="resource-bottom-progress-fill"
              style={{ width: `${taskProgress.progress}%` }}
            ></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="skill-header">
        <div className="skill-header-top">
          <span className="skill-header-icon">{skill.icon}</span>
          <div className="skill-header-text">
            <div className="skill-title-row">
              <h1 className="skill-title">{skill.name}</h1>
              <span className="skill-level-inline">Level {skill.level}</span>
            </div>
            <p className="skill-description">{skill.description}</p>
            
            {/* Clean Skill XP Display */}
            <div className="skill-xp-display">
              <span className="skill-xp-label">XP:</span>
              <span className="skill-xp-numbers">
                {skill.experience.toLocaleString()} / {skill.experienceToNext.toLocaleString()}
              </span>
              <div className="skill-xp-bar-inline">
                <div
                  className="skill-xp-bar-fill"
                  style={{
                    width: `${Math.min(100, (skill.experience / skill.experienceToNext) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Clean Veterancy Display */}
            {(() => {
              const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === skill.id)
              const experience = skillVeterancy?.experience || 0
              const experienceToNext = skillVeterancy?.experienceToNext || 1
              const level = skillVeterancy?.level || 0
              const pool = skillVeterancy?.pool || 0
              const veterancyPercent = Math.min(100, Math.max(0, (experience / Math.max(1, experienceToNext)) * 100))
              
              return (
                <div className="skill-veterancy-display">
                  <span className="veterancy-icon-small">🏆</span>
                  <span className="veterancy-label-inline">Veterancy:</span>
                  <button
                    className="veterancy-info-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowVeterancyPopup(true)
                    }}
                    title="Learn about Veterancy"
                  >
                    ℹ️
                  </button>
                  <span className="veterancy-level-inline">Level {level}</span>
                  <span className="veterancy-xp-inline">
                    {experience.toLocaleString()} / {experienceToNext.toLocaleString()} XP
                  </span>
                  <span className="veterancy-pool-inline">Pool: {pool.toLocaleString()}</span>
                  <div className="veterancy-bar-inline">
                    <div
                      className="veterancy-bar-fill"
                      style={{
                        width: `${veterancyPercent}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      <div className="skill-content">
        {isSalvaging ? (
          <>
            <section className="skill-section">
              <h2 className="section-title">AVAILABLE RESOURCES</h2>
              {availableResources.length > 0 ? (
                <div className="resources-grid">
                  {availableResources.map((resource) => renderResourceCard(resource, false))}
                </div>
              ) : (
                <div className="empty-resources">
                  <p>No resources available at your current level.</p>
                </div>
              )}
            </section>

            {lockedResources.length > 0 && (
              <section className="skill-section">
                <h2 className="section-title">LOCKED RESOURCES</h2>
                <div className="resources-grid">
                  {lockedResources.map((resource) => renderResourceCard(resource, true))}
                </div>
              </section>
            )}
          </>
        ) : (isSmelting || isEngineering) ? (
          <>
            {isEngineering && metalTypes.length > 0 && (
              <div className="metal-tabs-container">
                <div className="metal-tabs">
                  {metalTypes.map((metalNum) => (
                    <button
                      key={metalNum}
                      className={`metal-tab ${selectedMetalTab === metalNum ? 'active' : ''}`}
                      onClick={() => setSelectedMetalTab(metalNum)}
                    >
                      Placeholder Metal {metalNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <section className="skill-section">
              <h2 className="section-title">AVAILABLE RECIPES</h2>
              {availableRecipes.length > 0 ? (
                <div className="resources-grid">
                  {availableRecipes.map((recipe) => renderRecipeCard(recipe, false))}
                </div>
              ) : (
                <div className="empty-resources">
                  <p>No recipes available at your current level.</p>
                </div>
              )}
            </section>

            {lockedRecipes.length > 0 && (
              <section className="skill-section">
                <h2 className="section-title">LOCKED RECIPES</h2>
                <div className="resources-grid">
                  {lockedRecipes.map((recipe) => renderRecipeCard(recipe, true))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="skill-section">
            <h2 className="section-title">AVAILABLE ACTIONS</h2>
            <div className="actions-grid">
              <div className="action-card locked">
                <div className="action-icon">🔒</div>
                <div className="action-name">Locked Action</div>
                <div className="action-duration">0.0s</div>
                <div className="action-xp">0 XP</div>
                <div className="veterancy-bar">
                  <div className="veterancy-progress" style={{ width: '0%' }}></div>
                  <span className="veterancy-level">V0</span>
                </div>
              </div>
            </div>
            <div className="coming-soon">
              <p>Actions for this protocol coming soon...</p>
            </div>
          </section>
        )}
      </div>

      {/* Veterancy Info Popup */}
      {showVeterancyPopup && (
        <div className="veterancy-popup-overlay" onClick={() => setShowVeterancyPopup(false)}>
          <div className="veterancy-popup" onClick={(e) => e.stopPropagation()}>
            <div className="veterancy-popup-header">
              <h2>Veterancy System</h2>
              <button className="veterancy-popup-close" onClick={() => setShowVeterancyPopup(false)}>
                ×
              </button>
            </div>
            <div className="veterancy-popup-content">
              <div className="veterancy-popup-section">
                <h3>Resource Veterancy</h3>
                <p>Earn veterancy XP when gathering specific resources (1:1 ratio with skill XP).</p>
                <ul>
                  <li><strong>Multi-Resource Chance:</strong> +1% per level (max 200% = guaranteed +2 extra resources)</li>
                  <li><strong>Gather Limit Increase:</strong> +1 per 5 levels (max +50 = 60 total gathers before respawn)</li>
                  <li><strong>Max Level:</strong> 200</li>
                </ul>
              </div>

              <div className="veterancy-popup-section">
                <h3>Skill Veterancy</h3>
                <p>Earn veterancy XP when gaining skill XP (0.5:1 ratio). The XP pools infinitely and can be converted to resource veterancy.</p>
                <ul>
                  <li><strong>Speed Bonus:</strong> +0.5% per level (max 50% faster)</li>
                  <li><strong>Special Bonuses:</strong> Unlocked every 5-10 levels (skill-specific)</li>
                  <li><strong>Pool Conversion:</strong> 10 pool XP → 1 resource veterancy XP</li>
                  <li><strong>Max Level:</strong> 100 (pool is infinite)</li>
                </ul>
              </div>

              <div className="veterancy-popup-section">
                <h3>Example Bonuses</h3>
                <ul>
                  <li><strong>Salvaging:</strong> XP bonus every 10 levels, respawn speed every 5 levels</li>
                  <li><strong>Smelting:</strong> Material save chance every 10 levels, XP bonus every 5 levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Stats Tooltip */}
      {hoveredRecipe && hoveredRecipe.equipmentStats && (
        <div
          className="equipment-stats-tooltip"
          style={{
            position: 'fixed',
            left: `${hoverPosition.x + 15}px`,
            top: `${hoverPosition.y + 15}px`,
            zIndex: 1000,
          }}
        >
          <div className="tooltip-header">EQUIPMENT STATS</div>
          <div className="tooltip-content">
            {hoveredRecipe.equipmentStats.damage !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Damage:</span>
                <span className="tooltip-value">{hoveredRecipe.equipmentStats.damage}</span>
              </div>
            )}
            {hoveredRecipe.equipmentStats.armor !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Armor:</span>
                <span className="tooltip-value">{hoveredRecipe.equipmentStats.armor}</span>
              </div>
            )}
            <div className="tooltip-stat">
              <span className="tooltip-label">Attack Type:</span>
              <span className="tooltip-value">{hoveredRecipe.equipmentStats.attackType.toUpperCase()}</span>
            </div>
            <div className="tooltip-stat">
              <span className="tooltip-label">XP Scale:</span>
              <span className="tooltip-value">{hoveredRecipe.equipmentStats.attackScale}x</span>
            </div>
            {hoveredRecipe.equipmentStats.hitChance !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Hit Chance:</span>
                <span className="tooltip-value">+{hoveredRecipe.equipmentStats.hitChance}%</span>
              </div>
            )}
            {hoveredRecipe.equipmentStats.critChance !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Crit Chance:</span>
                <span className="tooltip-value">+{hoveredRecipe.equipmentStats.critChance}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
