import { useEffect, useState } from 'react'
import { Skill } from '../types/skills'
import { SALVAGING_RESOURCES, SalvagingResource } from '../types/salvagingResources'
import { SMELTING_RECIPES, SmeltingRecipe } from '../types/smeltingResources'
import { ENGINEERING_RECIPES, EngineeringRecipe } from '../types/engineeringResources'
import { getItemImage, getItemData } from '../types/items'
import { MEDICAE_RESEARCH_TOPICS, MedicaeResearchTopic } from '../types/medicaeResearch'
import { MEDICAL_ITEMS } from '../types/medicalItems'
import { getKnowledgeRarityColor } from '../utils/knowledgeRarity'
import { MEDICAE_SKILL_TREE, MedicaeSkill, MedicaeSkillType } from '../types/medicaeSkills'
import { useGameStore } from '../stores/gameStore'
import { getSpeedBonus, getGatherLimitIncrease } from '../utils/veterancy'
import CombatDashboard from './CombatDashboard'
import DungeonSelector from './DungeonSelector'
import Communication from './Communication'
import Commerce from './Commerce'
import Colony from './Colony'
import Farming from './Farming'
import { Enemy } from '../types/enemies'
import './MainContent.css'
import { getSkillIconPath, hasSkillIcon } from '../utils/skillIcons'
import { getVeterancyRankIconPath } from '../utils/veterancyIcons'

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
    startEngineering,
    stopEngineering,
    activeEngineeringTasks,
    startMedicaeResearch,
    stopMedicaeResearch,
    completeMedicaeResearchTask,
    activeMedicaeResearchTasks,
    addXP,
    addKnowledgePoints,
    unlockMedicaeSkill,
    knowledgePoints,
    unlockedMedicaeSkills,
    resources,
    resourceVeterancies,
    skillVeterancies,
    addResourceVeterancyXP,
    addSkillVeterancyXP,
    addResource,
    addNotification,
    combatActive,
    selectedEnemy,
    setCombatActive,
    setSelectedEnemy,
    skillCategories,
  } = useGameStore()

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [showVeterancyPopup, setShowVeterancyPopup] = useState(false)
  const [selectedMetalTab, setSelectedMetalTab] = useState<string | null>(null) // For engineering tab filtering
  const [selectedRecipe, setSelectedRecipe] = useState<EngineeringRecipe | null>(null) // For engineering detail panel
  const [engineeringTab, setEngineeringTab] = useState<'raw-materials' | 'gear'>('raw-materials') // For engineering tabs
  const [hoveredRecipe, setHoveredRecipe] = useState<EngineeringRecipe | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [hoveredItem, setHoveredItem] = useState<{ itemId: string; dropChance: number } | null>(null)
  const [itemHoverPosition, setItemHoverPosition] = useState({ x: 0, y: 0 })
  const [hoveredKnowledge, setHoveredKnowledge] = useState<{ rarity: number; dropChance: number } | null>(null)
  const [knowledgeHoverPosition, setKnowledgeHoverPosition] = useState({ x: 0, y: 0 })
  const [hoveredIngredient, setHoveredIngredient] = useState<string | null>(null)
  const [ingredientHoverPosition, setIngredientHoverPosition] = useState({ x: 0, y: 0 })
  const [medicaeTab, setMedicaeTab] = useState<'research' | 'skill-tree'>('research')

  // Update time every second to refresh timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100) // Update every 100ms for smoother progress

    return () => clearInterval(interval)
  }, [])

  // Determine skill types (do this early, before any early returns)
  const isSalvaging = skill?.id === 'salvaging'
  const isEngineering = skill?.id === 'engineering'
  const isCombat = skill?.id === 'bolter-training' || skill?.id === 'melee-combat'
  const isCommunication = skill?.id === 'communication'
  const isCommerce = skill?.id === 'commerce'
  const isColony = skill?.id === 'colony'
  const isMedicae = skill?.id === 'medicae'
  const isFarming = skill?.id === 'farming'

  // Mapping of ingredient resourceIds to metal tab info
  const METAL_TAB_MAPPING: Record<string, { tabNum: string; tabName: string }> = {
    'ferrite-ingot': { tabNum: '1', tabName: 'Ferrite' },
    'industrial-ingot': { tabNum: '2', tabName: 'Industrial' },
    'placeholder-metal-3': { tabNum: '3', tabName: 'Placeholder Metal 3' },
    'placeholder-metal-4': { tabNum: '4', tabName: 'Placeholder Metal 4' },
    'placeholder-metal-5': { tabNum: '5', tabName: 'Placeholder Metal 5' },
    'placeholder-metal-6': { tabNum: '6', tabName: 'Placeholder Metal 6' },
    'placeholder-metal-7': { tabNum: '7', tabName: 'Placeholder Metal 7' },
    'placeholder-metal-8': { tabNum: '8', tabName: 'Placeholder Metal 8' },
    'placeholder-metal-9': { tabNum: '9', tabName: 'Placeholder Metal 9' },
    'placeholder-metal-10': { tabNum: '10', tabName: 'Placeholder Metal 10' },
    'placeholder-metal-11': { tabNum: '11', tabName: 'Placeholder Metal 11' },
    'placeholder-metal-12': { tabNum: '12', tabName: 'Placeholder Metal 12' },
    'placeholder-metal-13': { tabNum: '13', tabName: 'Placeholder Metal 13' },
    'placeholder-metal-14': { tabNum: '14', tabName: 'Placeholder Metal 14' },
    'placeholder-metal-15': { tabNum: '15', tabName: 'Placeholder Metal 15' },
    'placeholder-metal-16': { tabNum: '16', tabName: 'Placeholder Metal 16' },
    'placeholder-metal-17': { tabNum: '17', tabName: 'Placeholder Metal 17' },
  }

  // For engineering, get unique metal types from recipes
  const getMetalTypes = () => {
    if (!isEngineering) return []
    const metalTypes = new Set<string>()
    ENGINEERING_RECIPES.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        // Check if ingredient is in our mapping
        if (METAL_TAB_MAPPING[ing.resourceId]) {
          metalTypes.add(METAL_TAB_MAPPING[ing.resourceId].tabNum)
        }
        // Fallback for old placeholder-metal- pattern
        else if (ing.resourceId.includes('placeholder-metal-')) {
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

  // Process completed Medicae research tasks
  // IMPORTANT: This hook must be called BEFORE any early returns
  useEffect(() => {
    if (!isMedicae || !skill) return

    activeMedicaeResearchTasks.forEach((task) => {
      if (!task.completed) {
        const elapsed = currentTime - task.startTime
        if (elapsed >= task.duration) {
          const topic = MEDICAE_RESEARCH_TOPICS.find((t) => t.id === task.topicId)
          if (topic) {
            // Get veterancy bonuses
            const topicVeterancy = resourceVeterancies.find((rv) => rv.resourceId === topic.id)
            const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === skill.id)
            const topicVeterancyLevel = topicVeterancy?.level || 0
            const skillVeterancyLevel = skillVeterancy?.level || 0
            
            // Award XP and knowledge points
            const baseXP = topic.xpReward
            addXP(skill.id, baseXP)
            addKnowledgePoints(topic.knowledgePointsReward)

            // Award veterancy XP
            // Topic veterancy: 1:1 ratio with skill XP
            addResourceVeterancyXP(topic.id, baseXP)
            // Skill veterancy: 0.5:1 ratio with skill XP
            addSkillVeterancyXP(skill.id, Math.floor(baseXP * 0.5))

            // Roll for item drop
            if (topic.itemDrop) {
              const roll = Math.random() * 100
              if (roll < topic.itemDrop.dropChance) {
                // Player got the item!
                addResource(topic.itemDrop.itemId, 1)
                const item = MEDICAL_ITEMS.find((i) => i.id === topic.itemDrop!.itemId)
                if (item) {
                  addNotification(`${item.name} +1 (from research)`)
                }
              }
            }

            // Roll for knowledge drop
            if (topic.knowledgeDrop) {
              const roll = Math.random() * 100
              if (roll < topic.knowledgeDrop.dropChance) {
                // Player got knowledge!
                addKnowledgePoints(1)
                const rarityInfo = getKnowledgeRarityColor(topic.knowledgeDrop.rarity)
                addNotification(`Knowledge +1 (${rarityInfo.name})`)
              }
            }

            // Mark task as completed
            completeMedicaeResearchTask(task.topicId)

            // Auto-resume if enabled
            if (task.autoResume) {
              const speedBonus = getSpeedBonus(skillVeterancyLevel)
              const baseDuration = topic.baseTime * 1000
              const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
              startMedicaeResearch(task.topicId, duration, true)
            }
          }
        }
      }
    })
  }, [
    currentTime,
    activeMedicaeResearchTasks,
    isMedicae,
    skill,
    addXP,
    addKnowledgePoints,
    completeMedicaeResearchTask,
    startMedicaeResearch,
    addResourceVeterancyXP,
    addSkillVeterancyXP,
    addResource,
    addNotification,
    resourceVeterancies,
    skillVeterancies,
  ])

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

  // Helper to render combat in background (only when not on combat skill)
  const renderBackgroundCombat = () => {
    // Don't render background combat if we're already on a combat skill (it's rendered normally)
    if (isCombat) return null
    if (!combatActive || !selectedEnemy) return null
    const combatSkill = skillCategories.flatMap(cat => cat.skills).find(s => s.id === 'bolter-training' || s.id === 'melee-combat')
    if (!combatSkill) return null
    return (
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', visibility: 'hidden', pointerEvents: 'none' }}>
        <CombatDashboard
          skillId={combatSkill.id}
          selectedEnemy={selectedEnemy}
          combatActive={combatActive}
          onCombatStop={() => setCombatActive(false)}
        />
      </div>
    )
  }

  // Render Communication skill
  if (isCommunication && skill) {
    return (
      <>
        <Communication skillId={skill.id} />
        {renderBackgroundCombat()}
      </>
    )
  }

  // Render Commerce skill
  if (isCommerce && skill) {
    return (
      <>
        <Commerce skillId={skill.id} />
        {renderBackgroundCombat()}
      </>
    )
  }

  // Render Colony skill
  if (isColony && skill) {
    return (
      <>
        <Colony skillId={skill.id} />
        {renderBackgroundCombat()}
      </>
    )
  }

  // Note: Farming is handled below in the main return, not here
  
  const availableResources = isSalvaging
    ? SALVAGING_RESOURCES.filter((resource) => resource.levelRequired <= skill.level)
    : []

  const lockedResources = isSalvaging
    ? SALVAGING_RESOURCES.filter((resource) => resource.levelRequired > skill.level)
    : []

  const availableTopics = isMedicae
    ? MEDICAE_RESEARCH_TOPICS.filter((topic) => topic.levelRequired <= skill.level)
    : []

  const lockedTopics = isMedicae
    ? MEDICAE_RESEARCH_TOPICS.filter((topic) => topic.levelRequired > skill.level)
    : []

  const handleTopicClick = (topic: MedicaeResearchTopic) => {
    const activeTask = activeMedicaeResearchTasks.find(
      (t) => t.topicId === topic.id && !t.completed
    )
    const isActive = !!activeTask

    if (isActive) {
      stopMedicaeResearch(topic.id)
    } else {
      // Stop ALL other active research tasks first
      activeMedicaeResearchTasks.forEach((task) => {
        if (task.topicId !== topic.id && !task.completed) {
          stopMedicaeResearch(task.topicId)
        }
      })

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

      // Stop ALL engineering activities
      activeEngineeringTasks.forEach((task) => {
        if (!task.completed) {
          stopEngineering(task.recipeId)
        }
      })

      // Apply speed bonus from skill veterancy
      const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === skill.id)
      const skillVeterancyLevel = skillVeterancy?.level || 0
      const speedBonus = getSpeedBonus(skillVeterancyLevel)
      const baseDuration = topic.baseTime * 1000
      const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
      
      // Start research with auto-resume enabled
      startMedicaeResearch(topic.id, duration, true)
    }
  }

  const getTopicProgress = (topicId: string) => {
    const task = activeMedicaeResearchTasks.find((t) => t.topicId === topicId && !t.completed)
    if (!task) return { progress: 0, remaining: 0 }
    const elapsed = currentTime - task.startTime
    const progress = Math.min(100, (elapsed / task.duration) * 100)
    const remaining = Math.max((task.duration - elapsed) / 1000, 0)
    return { progress, remaining }
  }

  const isTopicActive = (topicId: string) => {
    const activeTask = activeMedicaeResearchTasks.find((t) => t.topicId === topicId && !t.completed)
    return !!activeTask
  }

  const renderTopicCard = (topic: MedicaeResearchTopic, isLocked: boolean) => {
    if (isLocked) {
      return (
        <div key={topic.id} className="resource-card locked">
          <div className="resource-header">
            <div className="resource-icon-locked">?</div>
            <div className="resource-name">Locked</div>
          </div>
          <div className="resource-level-req">
            Level {topic.levelRequired} Required
          </div>
          <div className="resource-bottom-progress"></div>
        </div>
      )
    }

    const activeTask = activeMedicaeResearchTasks.find((t) => t.topicId === topic.id && !t.completed)
    const taskProgress = activeTask ? getTopicProgress(topic.id) : null
    const isActive = isTopicActive(topic.id)
    
    // Get topic veterancy
    const topicVeterancy = resourceVeterancies.find((rv) => rv.resourceId === topic.id)

    return (
      <div
        key={topic.id}
        className={`resource-card available ${isActive ? 'active' : ''}`}
        onClick={() => handleTopicClick(topic)}
      >
        {/* Header: Icon + Name on left, Duration on right */}
        <div className="resource-header">
          <div className="resource-header-left">
            <span className="resource-header-icon">{topic.icon || '📚'}</span>
            <div className="resource-name-wrapper">
              <span className="resource-name">{topic.name}</span>
            </div>
          </div>
          <span className="resource-duration">{topic.baseTime}s</span>
        </div>

        {/* Central Icon */}
        <div className="resource-icon-center">
          <span className="resource-large-icon">{topic.icon || '📚'}</span>
        </div>

        {/* XP Text Below Icon */}
        <div className="resource-xp">
          {topic.xpReward} XP
        </div>

        {/* Knowledge Points Reward */}
        <div className="resource-count">
          {topic.knowledgePointsReward} Knowledge
        </div>

        {/* Item Drop Display */}
        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem' }}>
          {topic.itemDrop && (() => {
            const item = MEDICAL_ITEMS.find((i) => i.id === topic.itemDrop!.itemId)
            return item ? (
              <div
                className="resource-item-drop"
                onMouseEnter={(e) => {
                  setHoveredItem({ itemId: topic.itemDrop!.itemId, dropChance: topic.itemDrop!.dropChance })
                  setItemHoverPosition({ x: e.clientX, y: e.clientY })
                }}
                onMouseLeave={() => setHoveredItem(null)}
                onMouseMove={(e) => {
                  if (hoveredItem && hoveredItem.itemId === topic.itemDrop!.itemId) {
                    setItemHoverPosition({ x: e.clientX, y: e.clientY })
                  }
                }}
              >
                <span className="resource-item-drop-icon">{item.icon}</span>
                <span className="resource-item-drop-chance">{topic.itemDrop.dropChance}%</span>
              </div>
            ) : null
          })()}

          {/* Knowledge Drop Display */}
          {topic.knowledgeDrop && (() => {
            const rarityColors = getKnowledgeRarityColor(topic.knowledgeDrop.rarity)
            return (
              <div
                className="resource-item-drop"
                style={{
                  background: rarityColors.background,
                  borderColor: rarityColors.border,
                }}
                onMouseEnter={(e) => {
                  setHoveredKnowledge({ rarity: topic.knowledgeDrop!.rarity, dropChance: topic.knowledgeDrop!.dropChance })
                  setKnowledgeHoverPosition({ x: e.clientX, y: e.clientY })
                }}
                onMouseLeave={() => setHoveredKnowledge(null)}
                onMouseMove={(e) => {
                  if (hoveredKnowledge && hoveredKnowledge.rarity === topic.knowledgeDrop!.rarity) {
                    setKnowledgeHoverPosition({ x: e.clientX, y: e.clientY })
                  }
                }}
              >
                <span className="resource-item-drop-icon" style={{ color: rarityColors.text, filter: `drop-shadow(0 0 3px ${rarityColors.glow})` }}>📚</span>
                <span className="resource-item-drop-chance" style={{ color: rarityColors.text, textShadow: `0 0 3px ${rarityColors.glow}` }}>{topic.knowledgeDrop.dropChance}%</span>
              </div>
            )
          })()}
        </div>

        {/* Topic Veterancy Bar - Compact design */}
        <div className="resource-veterancy">
          <div className="resource-veterancy-row">
            <div className="resource-veterancy-icon">
              <img 
                src={getVeterancyRankIconPath(topicVeterancy?.level || 0)} 
                alt={`Rank ${topicVeterancy?.level || 0}`}
              />
            </div>
            <div className="resource-veterancy-progress-wrapper">
              <div className="resource-veterancy-progress-bar">
                <div
                  className="resource-veterancy-progress-fill"
                  style={{
                    width: `${topicVeterancy 
                      ? Math.min(100, Math.max(0, ((topicVeterancy.experience || 0) / Math.max(1, topicVeterancy.experienceToNext || 1)) * 100))
                      : 0}%`,
                  }}
                ></div>
              </div>
              <div className="resource-veterancy-text">
                <span className="resource-veterancy-level">V{topicVeterancy?.level || 0}</span>
                <span className="resource-veterancy-xp">
                  {(topicVeterancy?.experience || 0).toLocaleString()} / {(topicVeterancy?.experienceToNext || 1).toLocaleString()} XP
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
            />
          )}
        </div>
      </div>
    )
  }

  const filterRecipesByMetal = (recipes: EngineeringRecipe[]) => {
    if (!isEngineering || !selectedMetalTab) return recipes
    return recipes.filter((recipe) => {
      return recipe.ingredients.some((ing) => {
        // Check if ingredient maps to the selected tab
        const metalInfo = METAL_TAB_MAPPING[ing.resourceId]
        if (metalInfo && metalInfo.tabNum === selectedMetalTab) {
          return true
        }
        // Fallback for old placeholder-metal- pattern
        if (ing.resourceId.includes('placeholder-metal-')) {
          const metalMatch = ing.resourceId.match(/placeholder-metal-(\d+)/)
          return metalMatch && metalMatch[1] === selectedMetalTab
        }
        return false
      })
    })
  }

  // Organize Medicae skills into categories for the skill tree
  const organizeSkillsByType = () => {
    const healing: MedicaeSkill[] = []
    const buff: MedicaeSkill[] = []
    const passive: MedicaeSkill[] = []

    MEDICAE_SKILL_TREE.forEach((skill) => {
      if (skill.type === MedicaeSkillType.Healing) {
        healing.push(skill)
      } else if (skill.type === MedicaeSkillType.Buff) {
        buff.push(skill)
      } else if (skill.type === MedicaeSkillType.Passive) {
        passive.push(skill)
      }
    })

    return { healing, buff, passive }
  }

  // Render the Medicae skill tree as a grid
  const renderMedicaeSkillTree = () => {
    const { healing, buff, passive } = organizeSkillsByType()

    const renderSkillCard = (skillNode: MedicaeSkill) => {
      const isUnlocked = unlockedMedicaeSkills.includes(skillNode.id)
      const currentSkillLevel = skill?.level || 1
      const canUnlock = skillNode.levelRequired <= currentSkillLevel && 
                        knowledgePoints >= skillNode.knowledgePointCost &&
                        skillNode.prerequisites.every((prereq: string) => unlockedMedicaeSkills.includes(prereq))
      
      const skillTypeColors: Record<MedicaeSkillType, { bg: string; border: string; text: string }> = {
        [MedicaeSkillType.Healing]: { bg: 'rgba(255, 0, 0, 0.2)', border: 'rgba(255, 0, 0, 0.6)', text: '#ff4444' },
        [MedicaeSkillType.Buff]: { bg: 'rgba(255, 215, 0, 0.2)', border: 'rgba(255, 215, 0, 0.6)', text: '#ffd700' },
        [MedicaeSkillType.Passive]: { bg: 'rgba(0, 255, 0, 0.2)', border: 'rgba(0, 255, 0, 0.6)', text: '#44ff44' },
      }
      const colors = skillTypeColors[skillNode.type]

      return (
        <div
          key={skillNode.id}
          className={`medicae-skill-card ${isUnlocked ? 'unlocked' : ''} ${canUnlock ? 'unlockable' : ''}`}
          style={{
            background: isUnlocked ? colors.bg : 'rgba(40, 40, 40, 0.8)',
            borderColor: isUnlocked ? colors.border : 'rgba(100, 100, 100, 0.3)',
          }}
        >
          <div className="medicae-skill-icon" style={{ color: isUnlocked ? colors.text : '#666666' }}>
            {skillNode.icon}
          </div>
          <div className="medicae-skill-name">{skillNode.name}</div>
          {!isUnlocked && (
            <div className="medicae-skill-cost">{skillNode.knowledgePointCost} KP</div>
          )}
          {skillNode.prerequisites.length > 0 && (
            <div className="medicae-skill-prereq">
              Requires: {skillNode.prerequisites.map(id => {
                const prereq = MEDICAE_SKILL_TREE.find(s => s.id === id)
                return prereq?.name || id
              }).join(', ')}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="medicae-skill-tree-grid">
        {/* Healing Column */}
        <div className="medicae-skill-column">
          <div className="medicae-column-header" style={{ color: '#ff4444' }}>
            HEALING
          </div>
          <div className="medicae-skill-column-content">
            {healing.map((skill) => renderSkillCard(skill))}
          </div>
        </div>

        {/* Buff Column */}
        <div className="medicae-skill-column">
          <div className="medicae-column-header" style={{ color: '#ffd700' }}>
            BUFFS
          </div>
          <div className="medicae-skill-column-content">
            {buff.map((skill) => renderSkillCard(skill))}
          </div>
        </div>

        {/* Passive Column */}
        <div className="medicae-skill-column">
          <div className="medicae-column-header" style={{ color: '#44ff44' }}>
            PASSIVE
          </div>
          <div className="medicae-skill-column-content">
            {passive.map((skill) => renderSkillCard(skill))}
          </div>
        </div>
      </div>
    )
  }

  // Helper to check if a recipe is a raw material (smelting recipe or engineering metal crafting recipe)
  const isRawMaterial = (recipe: SmeltingRecipe | EngineeringRecipe): boolean => {
    if (isEngineering) {
      // Check if it's a smelting recipe (by checking if it's in SMELTING_RECIPES)
      if (SMELTING_RECIPES.some((r) => r.id === recipe.id)) return true
      // Check if it's a metal crafting recipe (ends with '-craft')
      if (recipe.id.endsWith('-craft')) return true
    }
    return false
  }

  // Get raw material recipes (smelting + engineering metal crafting)
  const getRawMaterialRecipes = (): (SmeltingRecipe | EngineeringRecipe)[] => {
    const smeltingRecipes = SMELTING_RECIPES.map((r) => r as SmeltingRecipe | EngineeringRecipe)
    const engineeringMetalCrafts = ENGINEERING_RECIPES.filter((r) => r.id.endsWith('-craft'))
    return [...smeltingRecipes, ...engineeringMetalCrafts]
  }

  const availableRecipes = isEngineering
    ? (() => {
        if (engineeringTab === 'raw-materials') {
          return getRawMaterialRecipes().filter((recipe) => recipe.levelRequired <= skill.level)
        } else {
          // Filter gear recipes by metal tab if selected
          const filtered = ENGINEERING_RECIPES.filter((recipe) => 
            recipe.levelRequired <= skill.level && !recipe.id.endsWith('-craft')
          )
          return selectedMetalTab ? filterRecipesByMetal(filtered) : filtered
        }
      })()
    : []

  const lockedRecipes = isEngineering
    ? (() => {
        if (engineeringTab === 'raw-materials') {
          return getRawMaterialRecipes().filter((recipe) => recipe.levelRequired > skill.level)
        } else {
          // Filter gear recipes by metal tab if selected
          const filtered = ENGINEERING_RECIPES.filter((recipe) => 
            recipe.levelRequired > skill.level && !recipe.id.endsWith('-craft')
          )
          return selectedMetalTab ? filterRecipesByMetal(filtered) : filtered
        }
      })()
    : []

  const canCraftRecipe = (recipe: SmeltingRecipe | EngineeringRecipe) => {
    return recipe.ingredients.every(
      (ingredient) => (resources[ingredient.resourceId] || 0) >= ingredient.amount
    )
  }

  const handleRecipeClick = (recipe: SmeltingRecipe | EngineeringRecipe) => {
    const isEngineeringRecipe = isEngineering && ENGINEERING_RECIPES.some((r) => r.id === recipe.id)
    
    // For engineering, set selected recipe for detail panel
    if (isEngineering && !recipe.id.endsWith('-craft')) {
      setSelectedRecipe(recipe as EngineeringRecipe)
    }
    
    const activeEngineeringTask = activeEngineeringTasks.find((t) => t.recipeId === recipe.id && !t.completed)
    const isActive = !!activeEngineeringTask

    // Only proceed with crafting if we can craft
    if (!canCraftRecipe(recipe) && !isActive) {
      return
    }

    if (isActive) {
      // Stop the active task
      stopEngineering(recipe.id)
    } else {
      // Check if we have ingredients
      if (!canCraftRecipe(recipe)) {
        return // Can't craft without ingredients
      }

      // Stop ALL other engineering tasks first
      activeEngineeringTasks.forEach((task) => {
        if (task.recipeId !== recipe.id && !task.completed) {
          stopEngineering(task.recipeId)
        }
      })

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
      const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'engineering')
      const skillVeterancyLevel = skillVeterancy?.level || 0
      const speedBonus = getSpeedBonus(skillVeterancyLevel)
      const baseDuration = recipe.time * 1000
      const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
      
      // Start crafting this recipe
      startEngineering(recipe.id, duration, true) // Auto-resume enabled
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
    const isEngineeringRecipe = isEngineering && ENGINEERING_RECIPES.some((r) => r.id === recipe.id)
    const isEngineeringGear = isEngineering && engineeringTab === 'gear' && !recipe.id.endsWith('-craft')
    const isRawMaterialsTab = isEngineering && engineeringTab === 'raw-materials'
    // Check for image property in both EngineeringRecipe and SmeltingRecipe
    const recipeImage = isEngineeringRecipe 
      ? (recipe as EngineeringRecipe).image 
      : (recipe as SmeltingRecipe).image || null
    const recipeIcon = recipe.icon || recipeImage || '⚙️'
    const isSelected = isEngineering && selectedRecipe?.id === recipe.id
    
    if (isLocked) {
      return (
        <div 
          key={recipe.id} 
          className={`resource-card locked ${isSelected ? 'selected' : ''}`}
          onClick={() => isEngineering && setSelectedRecipe(recipe as EngineeringRecipe)}
        >
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

    const activeEngineeringTask = activeEngineeringTasks.find((t) => t.recipeId === recipe.id && !t.completed)
    const activeTask = activeEngineeringTask
    const canCraft = canCraftRecipe(recipe)
    // Only show progress if task is active AND we still have ingredients
    const taskProgress = activeTask && canCraft ? getCraftingProgress(activeTask) : null
    const isActive = !!activeTask && canCraft
    const hasResult = (resources[recipe.id] || 0) > 0
    
    // Get recipe veterancy
    const recipeVeterancy = resourceVeterancies.find((rv) => rv.resourceId === recipe.id)

    // Use horizontal layout for engineering gear recipes and raw materials
    if (isEngineeringGear || isRawMaterialsTab) {
      return (
        <div
          key={recipe.id}
          className={`resource-card available recipe-card-horizontal ${isActive ? 'active' : ''} ${!canCraft ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => {
            if (isEngineering) {
              setSelectedRecipe(recipe as EngineeringRecipe)
            } else {
              handleRecipeClick(recipe)
            }
          }}
          onMouseEnter={(e) => isEngineeringRecipe && handleRecipeMouseEnter(e, recipe as EngineeringRecipe)}
          onMouseLeave={handleRecipeMouseLeave}
          onMouseMove={(e) => {
            if (hoveredRecipe && hoveredRecipe.id === recipe.id) {
              setHoverPosition({ x: e.clientX, y: e.clientY })
            }
          }}
        >
          <div className="recipe-card-icon-section">
            {recipeImage ? (
              <img src={recipeImage} alt={recipe.name} style={{ width: '3rem', height: '3rem', objectFit: 'contain' }} />
            ) : (
              <span className="recipe-card-icon">{recipeIcon}</span>
            )}
          </div>
          <div className="recipe-card-details-section">
            <div className="recipe-card-header-row">
              <span className="recipe-card-name">{recipe.name}</span>
              <span className="recipe-card-duration">{recipe.time}s</span>
            </div>
            <div className="recipe-card-info-row">
              <span className="recipe-card-xp">{recipe.xpReward} XP</span>
              {hasResult && <span className="recipe-card-count">{(resources[recipe.id] || 0).toLocaleString()}</span>}
            </div>
            <div className="recipe-card-ingredients">
              {recipe.ingredients.map((ingredient, idx) => {
                const hasIngredient = (resources[ingredient.resourceId] || 0) >= ingredient.amount
                const ingredientImage = getItemImage(ingredient.resourceId)
                const ingredientData = getItemData(ingredient.resourceId)
                return (
                  <div key={idx} className={`ingredient-item ${hasIngredient ? '' : 'missing'}`}>
                    <img src={ingredientImage} alt={ingredientData?.name || 'Ingredient'} style={{ width: '1.25rem', height: '1.25rem', objectFit: 'contain' }} />
                    <span>{ingredient.amount}x</span>
                  </div>
                )
              })}
            </div>
            <div className="recipe-card-footer-row">
              <div className="resource-veterancy">
                <div className="resource-veterancy-row">
                  <div className="resource-veterancy-icon">
                    <img 
                      src={getVeterancyRankIconPath(recipeVeterancy?.level || 0)} 
                      alt={`Rank ${recipeVeterancy?.level || 0}`}
                    />
                  </div>
                  <div className="resource-veterancy-progress-wrapper">
                    <div className="resource-veterancy-progress-bar">
                      <div
                        className="resource-veterancy-progress-fill"
                        style={{
                          width: `${recipeVeterancy 
                            ? Math.min(100, Math.max(0, ((recipeVeterancy.experience || 0) / Math.max(1, recipeVeterancy.experienceToNext || 1)) * 100))
                            : 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="resource-veterancy-text">
                      <span className="resource-veterancy-level">V{recipeVeterancy?.level || 0}</span>
                    </div>
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
        </div>
      )
    }

    // Vertical layout for raw materials
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
            <span className="resource-header-icon">
              {recipeImage ? (
                <img src={recipeImage} alt={recipe.name} style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} />
              ) : (
                recipeIcon
              )}
            </span>
            <span className="resource-name">{recipe.name}</span>
          </div>
          <span className="resource-duration">{recipe.time}s</span>
        </div>

        {/* Central Icon */}
        <div className="resource-icon-center">
          <span className="resource-large-icon">
            {recipeImage ? (
              <img src={recipeImage} alt={recipe.name} style={{ width: '4rem', height: '4rem', objectFit: 'contain' }} />
            ) : (
              recipeIcon
            )}
          </span>
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
            const ingredientImage = getItemImage(ingredient.resourceId)
            return (
              <div key={idx} className={`ingredient-item ${hasIngredient ? '' : 'missing'}`}>
                <img src={ingredientImage} alt={ingredient.resourceId} style={{ width: '1rem', height: '1rem', objectFit: 'contain' }} />
                <span>{ingredient.amount}x</span>
              </div>
            )
          })}
        </div>

        {/* Recipe Veterancy Bar - Compact design */}
        <div className="resource-veterancy">
          <div className="resource-veterancy-row">
            <div className="resource-veterancy-icon">
              <img 
                src={getVeterancyRankIconPath(recipeVeterancy?.level || 0)} 
                alt={`Rank ${recipeVeterancy?.level || 0}`}
              />
            </div>
            <div className="resource-veterancy-progress-wrapper">
              <div className="resource-veterancy-progress-bar">
                <div
                  className="resource-veterancy-progress-fill"
                  style={{
                    width: `${recipeVeterancy 
                      ? Math.min(100, Math.max(0, ((recipeVeterancy.experience || 0) / Math.max(1, recipeVeterancy.experienceToNext || 1)) * 100))
                      : 0}%`,
                  }}
                ></div>
              </div>
              <div className="resource-veterancy-text">
                <span className="resource-veterancy-level">V{recipeVeterancy?.level || 0}</span>
                <span className="resource-veterancy-xp">
                  {(recipeVeterancy?.experience || 0).toLocaleString()} / {(recipeVeterancy?.experienceToNext || 1).toLocaleString()} XP
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

  const renderRecipeDetailPanel = () => {
    if (!selectedRecipe) {
      return (
        <div className="recipe-detail-panel empty">
          <p>Select a recipe to view details</p>
        </div>
      )
    }

    const canCraft = canCraftRecipe(selectedRecipe)
    const hasResult = (resources[selectedRecipe.id] || 0) > 0
    const recipeVeterancy = resourceVeterancies.find((rv) => rv.resourceId === selectedRecipe.id)
    const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'engineering')
    // Check for image property in both EngineeringRecipe and SmeltingRecipe
    const recipeImage = isEngineering 
      ? (selectedRecipe as EngineeringRecipe).image 
      : (selectedRecipe as SmeltingRecipe).image || null
    const recipeIcon = selectedRecipe.icon || recipeImage || '⚙️'

    return (
      <div className="recipe-detail-panel">
        <div className="recipe-detail-header">
          <div className="recipe-detail-icon">
            {recipeImage ? (
              <img src={recipeImage} alt={selectedRecipe.name} style={{ width: '3.5rem', height: '3.5rem', objectFit: 'contain' }} />
            ) : (
              recipeIcon
            )}
          </div>
          <div className="recipe-detail-separator"></div>
          <div className="recipe-detail-header-content">
            <div className="recipe-detail-level">LEVEL {selectedRecipe.levelRequired}</div>
            <div className="recipe-detail-name">{selectedRecipe.name}</div>
            {hasResult && (
              <div className="recipe-detail-owned">Owned: {(resources[selectedRecipe.id] || 0).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div className="recipe-detail-sections">
          <div className="recipe-detail-section">
            <div className="recipe-detail-requirements-header">
              <div className="recipe-detail-section-title">REQUIRES</div>
              <div className="recipe-detail-section-title">YOU HAVE</div>
            </div>
            <div className="recipe-detail-requirements-row">
              <div className="recipe-detail-ingredients">
                {selectedRecipe.ingredients.map((ingredient, idx) => {
                  const hasIngredient = (resources[ingredient.resourceId] || 0) >= ingredient.amount
                  const ingredientImage = getItemImage(ingredient.resourceId)
                  const ingredientData = getItemData(ingredient.resourceId)
                  const hasAmount = (resources[ingredient.resourceId] || 0)
                  return (
                    <div key={idx} className="recipe-detail-ingredient-row">
                      <div 
                        className={`recipe-detail-ingredient-box ${hasIngredient ? '' : 'missing'}`}
                        onMouseEnter={(e) => {
                          setHoveredIngredient(ingredient.resourceId)
                          setIngredientHoverPosition({ x: e.clientX, y: e.clientY })
                        }}
                        onMouseLeave={() => setHoveredIngredient(null)}
                        onMouseMove={(e) => {
                          if (hoveredIngredient === ingredient.resourceId) {
                            setIngredientHoverPosition({ x: e.clientX, y: e.clientY })
                          }
                        }}
                      >
                        <div className="recipe-detail-ingredient-icon">
                          <img src={ingredientImage} alt={ingredientData?.name || 'Ingredient'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="recipe-detail-ingredient-quantity">{ingredient.amount}x</div>
                      </div>
                      <div className={`recipe-detail-you-have-box ${hasAmount >= ingredient.amount ? '' : 'missing'}`}>
                        {hasAmount.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="recipe-detail-section">
            <div className="recipe-detail-section-title">PRODUCES</div>
            <div className="recipe-detail-produces">
              <div className="recipe-detail-ingredient">
                <div className="recipe-detail-ingredient-icon">
                  {recipeImage ? (
                    <img src={recipeImage} alt={selectedRecipe.name} style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
                  ) : (
                    recipeIcon
                  )}
                </div>
                <div className="recipe-detail-ingredient-amount">1x {selectedRecipe.name}</div>
              </div>
            </div>
          </div>

          <div className="recipe-detail-section">
            <div className="recipe-detail-section-title">GRANTS</div>
            <div className="recipe-detail-grants">
              <div className="recipe-detail-grant">
                <span className="grant-icon">⭐</span>
                <span className="grant-label">XP:</span>
                <span className="grant-value">{selectedRecipe.xpReward}</span>
              </div>
              {recipeVeterancy && (
                <div className="recipe-detail-grant">
                  <span className="grant-icon">
                    <img 
                      src={getVeterancyRankIconPath(recipeVeterancy.level)} 
                      alt={`Rank ${recipeVeterancy.level}`}
                      style={{ width: '1rem', height: '1rem', objectFit: 'contain' }}
                    />
                  </span>
                  <span className="grant-label">Veterancy:</span>
                  <span className="grant-value">V{recipeVeterancy.level}</span>
                </div>
              )}
            </div>
          </div>

          <button
            className={`recipe-detail-create-btn ${canCraft ? '' : 'disabled'}`}
            onClick={() => canCraft && handleRecipeClick(selectedRecipe)}
            disabled={!canCraft}
          >
            CREATE
          </button>
          <div className="recipe-detail-time">Time: {selectedRecipe.time}s</div>
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
            <span className="resource-header-icon">
              <img 
                src={getItemImage(resource.id)}
                alt={resource.name}
                style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
              />
            </span>
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
          <span className="resource-large-icon">
            <img 
              src={getItemImage(resource.id)}
              alt={resource.name}
              style={{ width: '4rem', height: '4rem', objectFit: 'contain' }}
            />
          </span>
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
            <div className="resource-veterancy-icon">
              <img 
                src={getVeterancyRankIconPath(resourceVeterancy?.level || 0)} 
                alt={`Rank ${resourceVeterancy?.level || 0}`}
              />
            </div>
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
    <>
      <div className="main-content">
      <div className="skill-header">
        <div className="skill-header-top">
          {hasSkillIcon(skill.id) ? (
            <img 
              src={getSkillIconPath(skill.id)} 
              alt={skill.name}
              className="skill-header-icon"
            />
          ) : (
            <span className="skill-header-icon">{skill.icon}</span>
          )}
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
                <div className="skill-xp-bar-tech-grid"></div>
                <div className="skill-xp-bar-tech-border"></div>
                <div
                  className="skill-xp-bar-fill"
                  style={{
                    width: `${Math.min(100, (skill.experience / skill.experienceToNext) * 100)}%`,
                  }}
                >
                  <div className="skill-xp-bar-inner-glow"></div>
                  <div className="skill-xp-bar-edge-glow"></div>
                  <div className="skill-xp-bar-pulse"></div>
                </div>
                <div className="skill-xp-bar-corner-accent skill-xp-bar-corner-left"></div>
                <div className="skill-xp-bar-corner-accent skill-xp-bar-corner-right"></div>
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
                  <span className="veterancy-icon-small">
                    <img 
                      src={getVeterancyRankIconPath(level)} 
                      alt={`Rank ${level}`}
                    />
                  </span>
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
                    <div className="veterancy-bar-tech-grid"></div>
                    <div className="veterancy-bar-tech-border"></div>
                    <div
                      className="veterancy-bar-fill"
                      style={{
                        width: `${veterancyPercent}%`,
                      }}
                    >
                      <div className="veterancy-bar-inner-glow"></div>
                      <div className="veterancy-bar-edge-glow"></div>
                      <div className="veterancy-bar-pulse"></div>
                    </div>
                    <div className="veterancy-bar-corner-accent veterancy-bar-corner-left"></div>
                    <div className="veterancy-bar-corner-accent veterancy-bar-corner-right"></div>
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
        ) : isMedicae ? (
          <>
            {/* Medicae Tab Switcher */}
            <div className="metal-tabs-container">
              <div className="metal-tabs">
                <button
                  className={`metal-tab ${medicaeTab === 'research' ? 'active' : ''}`}
                  onClick={() => setMedicaeTab('research')}
                >
                  RESEARCH
                </button>
                <button
                  className={`metal-tab ${medicaeTab === 'skill-tree' ? 'active' : ''}`}
                  onClick={() => setMedicaeTab('skill-tree')}
                >
                  SKILL TREE
                </button>
              </div>
            </div>

            {medicaeTab === 'research' ? (
              <>
                <section className="skill-section">
                  <h2 className="section-title">AVAILABLE RESEARCH</h2>
                  {availableTopics.length > 0 ? (
                    <div className="resources-grid">
                      {availableTopics.map((topic) => renderTopicCard(topic, false))}
                    </div>
                  ) : (
                    <div className="empty-resources">
                      <p>No research topics available at your current level.</p>
                    </div>
                  )}
                </section>

                {lockedTopics.length > 0 && (
                  <section className="skill-section">
                    <h2 className="section-title">LOCKED RESEARCH</h2>
                    <div className="resources-grid">
                      {lockedTopics.map((topic) => renderTopicCard(topic, true))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="medicae-skill-tree-container">
                {renderMedicaeSkillTree()}
              </div>
            )}
          </>
        ) : isEngineering ? (
          <>
            {/* Engineering Tab Switcher */}
            {isEngineering && (
              <div className="metal-tabs-container">
                <div className="metal-tabs">
                  <button
                    className={`metal-tab ${engineeringTab === 'raw-materials' ? 'active' : ''}`}
                    onClick={() => {
                      setEngineeringTab('raw-materials')
                      setSelectedRecipe(null)
                    }}
                  >
                    RAW MATERIALS
                  </button>
                  <button
                    className={`metal-tab ${engineeringTab === 'gear' ? 'active' : ''}`}
                    onClick={() => {
                      setEngineeringTab('gear')
                      setSelectedRecipe(null)
                    }}
                  >
                    GEAR
                  </button>
                </div>
              </div>
            )}

            {/* Metal Type Tabs (only for Engineering Gear) */}
            {isEngineering && engineeringTab === 'gear' && metalTypes.length > 0 && (
              <div className="metal-tabs-container">
                <div className="metal-tabs">
                  {metalTypes.map((metalNum) => {
                    // Find the tab name from mapping
                    const tabInfo = Object.values(METAL_TAB_MAPPING).find(m => m.tabNum === metalNum)
                    const tabName = tabInfo?.tabName || `Placeholder Metal ${metalNum}`
                    
                    return (
                      <button
                        key={metalNum}
                        className={`metal-tab ${selectedMetalTab === metalNum ? 'active' : ''}`}
                        onClick={() => setSelectedMetalTab(metalNum)}
                      >
                        {tabName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Engineering Layout with Detail Panel */}
            {isEngineering ? (
              <div className="engineering-layout">
                <div className="engineering-recipes-panel">
                  <section className="skill-section" style={{ marginTop: 0 }}>
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
                </div>
                {renderRecipeDetailPanel()}
              </div>
            ) : (
              <>
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
            )}
          </>
        ) : isFarming ? (
          <Farming skillId={skill.id} />
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
                  <li><strong>Engineering:</strong> Material save chance every 10 levels, XP bonus every 5 levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Drop Tooltip */}
      {hoveredItem && (() => {
        const item = MEDICAL_ITEMS.find((i) => i.id === hoveredItem.itemId)
        return item ? (
          <div
            className="equipment-stats-tooltip"
            style={{
              position: 'fixed',
              left: `${itemHoverPosition.x + 15}px`,
              top: `${itemHoverPosition.y + 15}px`,
              zIndex: 10000,
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-icon">{item.icon}</span>
              <span className="tooltip-title">{item.name}</span>
            </div>
            <div className="tooltip-content">
              <div className="tooltip-stat">
                <span className="tooltip-label">Drop Chance:</span>
                <span className="tooltip-value">{hoveredItem.dropChance}%</span>
              </div>
              <div className="tooltip-description">{item.description}</div>
            </div>
          </div>
        ) : null
      })()}

      {/* Knowledge Drop Tooltip */}
      {hoveredKnowledge && (() => {
        const rarityInfo = getKnowledgeRarityColor(hoveredKnowledge.rarity)
        return (
          <div
            className="equipment-stats-tooltip"
            style={{
              position: 'fixed',
              left: `${knowledgeHoverPosition.x + 15}px`,
              top: `${knowledgeHoverPosition.y + 15}px`,
              zIndex: 10000,
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-icon" style={{ color: rarityInfo.text }}>📚</span>
              <span className="tooltip-title" style={{ color: rarityInfo.text }}>{rarityInfo.name} Knowledge</span>
            </div>
            <div className="tooltip-content">
              <div className="tooltip-stat">
                <span className="tooltip-label">Drop Chance:</span>
                <span className="tooltip-value">{hoveredKnowledge.dropChance}%</span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">Rarity:</span>
                <span className="tooltip-value" style={{ color: rarityInfo.text }}>{hoveredKnowledge.rarity}/12</span>
              </div>
              <div className="tooltip-description">Grants 1 Knowledge Point when dropped.</div>
            </div>
          </div>
        )
      })()}
      
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
            {hoveredRecipe.equipmentStats.armorType && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Armor Type:</span>
                <span className="tooltip-value">{hoveredRecipe.equipmentStats.armorType.toUpperCase()}</span>
              </div>
            )}
            {hoveredRecipe.equipmentStats.damageReductionPercent !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Damage Reduction:</span>
                <span className="tooltip-value">+{hoveredRecipe.equipmentStats.damageReductionPercent}%</span>
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
            {hoveredRecipe.equipmentStats.accuracy !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Accuracy:</span>
                <span className="tooltip-value">+{hoveredRecipe.equipmentStats.accuracy}</span>
              </div>
            )}
            {hoveredRecipe.equipmentStats.accuracyPercent !== undefined && (
              <div className="tooltip-stat">
                <span className="tooltip-label">Accuracy %:</span>
                <span className="tooltip-value">+{hoveredRecipe.equipmentStats.accuracyPercent}%</span>
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

      {/* Ingredient tooltip in detail panel */}
      {hoveredIngredient && (() => {
        const ingredientData = getItemData(hoveredIngredient)
        if (!ingredientData) return null
        
        const ownedAmount = resources[hoveredIngredient] || 0
        
        return (
          <div
            className="equipment-stats-tooltip"
            style={{
              position: 'fixed',
              left: `${ingredientHoverPosition.x + 15}px`,
              top: `${ingredientHoverPosition.y + 15}px`,
              zIndex: 10000,
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-icon">
                <img src={getItemImage(hoveredIngredient)} alt={ingredientData.name} style={{ width: '1.2rem', height: '1.2rem', objectFit: 'contain', marginRight: '0.5rem' }} />
              </span>
              <span className="tooltip-title">{ingredientData.name}</span>
            </div>
            <div className="tooltip-content">
              {ingredientData.description && (
                <div className="tooltip-description">{ingredientData.description}</div>
              )}
              {ingredientData.value > 0 && (
                <div className="tooltip-stat">
                  <span className="tooltip-label">Value:</span>
                  <span className="tooltip-value">{ingredientData.value.toLocaleString()} gold</span>
                </div>
              )}
              <div className="tooltip-stat">
                <span className="tooltip-label">Owned:</span>
                <span className="tooltip-value">{ownedAmount.toLocaleString()}</span>
              </div>
              {ingredientData.category && (
                <div className="tooltip-stat">
                  <span className="tooltip-label">Category:</span>
                  <span className="tooltip-value">{ingredientData.category.toUpperCase()}</span>
                </div>
              )}
              {ingredientData.levelRequired && (
                <div className="tooltip-stat">
                  <span className="tooltip-label">Level Required:</span>
                  <span className="tooltip-value">{ingredientData.levelRequired}</span>
                </div>
              )}
            </div>
          </div>
        )
      })()}
      </div>
      {renderBackgroundCombat()}
    </>
  )
}
