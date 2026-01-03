import { create } from 'zustand'
import { Skill, SkillCategoryData, SKILL_CATEGORIES } from '../types/skills'
import { Village, Building, Villager, BuildingDefinition, BUILDING_DEFINITIONS, VILLAGER_TYPES, VillagerType } from '../types/village'

interface User {
  id: string
  username: string
  email: string
  gameData: {
    gold: number
    resources: Record<string, number>
    skills: Record<string, any>
  }
}

import { ActiveSalvagingTask, ResourceRespawn, ResourceGatherCount, ActiveEngineeringTask, ActiveMedicaeResearchTask } from '../types/activeTasks'
import { FarmingPlot } from '../types/farming'
import { Notification } from '../types/notifications'
import { ResourceVeterancy, SkillVeterancy, VETERANCY_CONFIG } from '../types/veterancy'
import { Planet, ActiveContactTask } from '../types/planets'
import { Enemy } from '../types/enemies'
import { generateInitialPlanets } from '../data/planets'
import { initializeVillage, calculateBuildingCost, calculateConstructionTime, calculateBuildingXP, getMaxDailyConstructions, getMaxDailyRecruits, shouldResetDailyLimits, getMaxBuildingLimit, calculateProductionBuildingUpgradeCost, getMaxWorkersForLevel, calculateEffectiveProductionRate } from '../utils/village'
import { getCumulativeExperience, getExperienceProgress, getExperienceForLevel } from '../utils/experience'
import {
  getResourceVeterancyProgress,
  getCumulativeResourceVeterancyXP,
  getSkillVeterancyLevelFromPool,
  getSkillVeterancyXPForNextLevel,
  getCumulativeSkillVeterancyXP,
} from '../utils/veterancy'
import { SEEDS, getSeedById } from '../types/seeds'
import { SEEDS } from '../types/seeds'

interface GameState {
  authenticated: boolean
  user: User | null
  connected: boolean
  playerId: string | null
  players: Record<string, any>
  selectedSkill: Skill | null
  skillCategories: SkillCategoryData[]
  gold: number
  resources: Record<string, number>
  inventoryOpen: boolean
  activeSalvagingTasks: ActiveSalvagingTask[]
  resourceRespawns: ResourceRespawn[]
  resourceGatherCounts: ResourceGatherCount[]
  activeEngineeringTasks: ActiveEngineeringTask[]
  activeMedicaeResearchTasks: ActiveMedicaeResearchTask[]
  knowledgePoints: number
  unlockedMedicaeSkills: string[]
  resourceVeterancies: ResourceVeterancy[]
  skillVeterancies: SkillVeterancy[]
  notifications: Notification[]
  farmingPlots: FarmingPlot[]
  purchaseFarmingPlot: () => void
  plantSeed: (plotId: string, seedId: string) => void
  harvestCrop: (plotId: string) => void
  combatSubStats: {
    strength: { level: number; experience: number; experienceToNext: number }
    attack: { level: number; experience: number; experienceToNext: number }
    defence: { level: number; experience: number; experienceToNext: number }
    agility: { level: number; experience: number; experienceToNext: number }
  }
  equippedItems: Record<string, string> // slotKey -> itemId
  combatActive: boolean
  selectedEnemy: Enemy | null
  addNotification: (message: string) => void
  removeNotification: (id: string) => void
  addResourceVeterancyXP: (resourceId: string, amount: number) => void
  addSkillVeterancyXP: (skillId: string, amount: number) => void
  addCombatSubStatXP: (statType: 'strength' | 'attack' | 'defence' | 'agility', amount: number) => void
  convertSkillVeterancyToResource: (skillId: string, resourceId: string, amount: number) => void
  activeEngineeringTasks: ActiveEngineeringTask[]
  startEngineering: (recipeId: string, duration: number, autoResume: boolean) => void
  completeEngineeringTask: (recipeId: string) => void
  stopEngineering: (recipeId: string) => void
  activeMedicaeResearchTasks: ActiveMedicaeResearchTask[]
  startMedicaeResearch: (topicId: string, duration: number, autoResume: boolean) => void
  completeMedicaeResearchTask: (topicId: string) => void
  stopMedicaeResearch: (topicId: string) => void
  knowledgePoints: number
  addKnowledgePoints: (amount: number) => void
  unlockedMedicaeSkills: string[]
  unlockMedicaeSkill: (skillId: string) => void
  planets: Planet[]
  activeContactTasks: ActiveContactTask[]
  startContact: (planetId: string, duration: number) => void
  completeContactTask: (planetId: string) => void
  discoverPlanet: (planetId: string) => void
  updatePlanetTradeItems: (planetId: string, tradeItems: Planet['tradeItems']) => void
  setPlanetRotation: (planetId: string, nextRotation: number) => void
  village: Village
  startBuildingConstruction: (buildingType: BuildingDefinition['id']) => void
  completeBuildingConstruction: (buildingId: string) => void
  recruitVillager: (villagerType: VillagerType) => void
  assignVillagerToBuilding: (villagerId: string, buildingId: string | null) => void
  collectBuildingResources: (buildingId: string) => void
  updateBuildingProduction: () => void
  upgradeBuilding: (buildingId: string) => void
  cheatCompleteBuilding: (buildingId: string) => void
  cheatAddVillageResource: (resource: 'wood' | 'stone' | 'food' | 'herbs', amount: number) => void
  cheatAddWorker: () => void
  setAuthenticated: (authenticated: boolean) => void
  setUser: (user: User | null) => void
  connect: () => void
  disconnect: () => void
  setPlayerId: (id: string) => void
  setConnected: (connected: boolean) => void
  selectSkill: (skill: Skill) => void
  toggleCategory: (categoryName: string) => void
  addResource: (resourceId: string, amount: number) => void
  removeResource: (resourceId: string, amount: number) => void
  addGold: (amount: number) => void
  addXP: (skillId: string, amount: number) => void
  removeXP: (skillId: string, amount: number) => void
  removeCombatSubStatXP: (statType: 'strength' | 'attack' | 'defence' | 'agility', amount: number) => void
  startSalvaging: (resourceId: string, duration: number) => void
  completeSalvagingTask: (taskId: string) => void
  setResourceRespawn: (resourceId: string, respawnTime: number) => void
  incrementGatherCount: (resourceId: string, autoResume?: boolean) => void
  resetGatherCount: (resourceId: string) => void
  setAutoResume: (resourceId: string, autoResume: boolean) => void
  stopSalvaging: (resourceId: string) => void
  setInventoryOpen: (open: boolean) => void
  setEquippedItem: (slotKey: string, itemId: string | null) => void
  setCombatActive: (active: boolean) => void
  setSelectedEnemy: (enemy: Enemy | null) => void
  logout: () => void
}

export const useGameStore = create<GameState>((set) => ({
  authenticated: false,
  user: null,
  connected: false,
  playerId: null,
  players: {},
  selectedSkill: null,
  skillCategories: SKILL_CATEGORIES,
  gold: 0,
  resources: {},
  inventoryOpen: false,
  activeSalvagingTasks: [],
  resourceRespawns: [],
  resourceGatherCounts: [],
  activeEngineeringTasks: [],
  activeMedicaeResearchTasks: [],
  knowledgePoints: 0,
  unlockedMedicaeSkills: [],
  planets: (() => {
    const planets = generateInitialPlanets()
    // Add pre-discovered seed vendor planet with initial seeds
    const starterSeeds = SEEDS.filter((seed) => seed.levelRequired <= 10) // First 10 levels
    
    const seedVendorPlanet: Planet = {
      id: 'seed-vendor-agri-primus',
      name: 'Agri-Primus Seed Market',
      type: 'agri-world',
      discovered: true,
      contactCostGold: 0,
      contactDuration: 0,
      tradeItems: starterSeeds.map((seed) => ({
        resourceId: seed.id,
        resourceName: seed.name,
        icon: seed.image || seed.icon || '',
        buyPrice: seed.cost,
        sellPrice: null,
        availableQuantity: 0, // Unlimited
        maxQuantity: 999999,
      })),
      rotationInterval: 3600000, // 1 hour
      nextRotation: Date.now() + 3600000,
      size: 'medium',
      reputation: 100,
    }
    return [seedVendorPlanet, ...planets]
  })(),
  activeContactTasks: [],
  village: initializeVillage(),
  resourceVeterancies: [],
  skillVeterancies: [],
  notifications: [],
  farmingPlots: [],
  combatSubStats: {
    strength: { level: 1, experience: 0, experienceToNext: getExperienceForLevel(2) },
    attack: { level: 1, experience: 0, experienceToNext: getExperienceForLevel(2) },
    defence: { level: 1, experience: 0, experienceToNext: getExperienceForLevel(2) },
    agility: { level: 1, experience: 0, experienceToNext: getExperienceForLevel(2) },
  },
  equippedItems: {},
  combatActive: false,
  selectedEnemy: null,
  addNotification: (message: string) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: `${Date.now()}-${Math.random()}`,
          message,
          timestamp: Date.now(),
        },
      ],
    })),
  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  setAuthenticated: (authenticated: boolean) => set({ authenticated }),
  setUser: (user: User | null) => set({ user, authenticated: !!user, gold: user?.gameData?.gold || 0, resources: user?.gameData?.resources || {} }),
  connect: () => set({ connected: true }),
  disconnect: () => set({ connected: false }),
  setPlayerId: (id: string) => set({ playerId: id }),
  setConnected: (connected: boolean) => set({ connected }),
  selectSkill: (skill: Skill) => set({ selectedSkill: skill }),
  toggleCategory: (categoryName: string) =>
    set((state) => ({
      skillCategories: state.skillCategories.map((cat) =>
        cat.name === categoryName ? { ...cat, collapsed: !cat.collapsed } : cat
      ),
    })),
  addResource: (resourceId: string, amount: number) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [resourceId]: (state.resources[resourceId] || 0) + amount,
      },
    })),
  removeResource: (resourceId: string, amount: number) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [resourceId]: Math.max(0, (state.resources[resourceId] || 0) - amount),
      },
    })),
  addGold: (amount: number) =>
    set((state) => ({ gold: state.gold + amount })),
  addXP: (skillId: string, amount: number) =>
    set((state) => {
      const updatedCategories = state.skillCategories.map((cat) => ({
        ...cat,
        skills: cat.skills.map((skill) => {
          if (skill.id === skillId) {
            // Get current cumulative experience
            const currentCumulativeXP = getCumulativeExperience(skill.level) + skill.experience
            // Add new experience
            const newCumulativeXP = currentCumulativeXP + amount
            // Calculate new level and progress using Melvor formula
            const progress = getExperienceProgress(newCumulativeXP)
            
            return {
              ...skill,
              level: progress.level,
              experience: progress.experience,
              experienceToNext: progress.experienceToNext,
            }
          }
          return skill
        }),
      }))
      
      // Update village level if Colony skill leveled up
      let updatedVillage = state.village
      if (skillId === 'colony') {
        const colonySkill = updatedCategories
          .flatMap((cat) => cat.skills)
          .find((s) => s.id === 'colony')
        if (colonySkill && colonySkill.level !== state.village.level) {
          updatedVillage = {
            ...state.village,
            level: colonySkill.level,
          }
        }
      }
      
      // Update selectedSkill if it was the one that gained XP - ensure it's never null
      let updatedSelectedSkill = state.selectedSkill
      if (updatedSelectedSkill?.id === skillId) {
        const category = updatedCategories.find((cat) =>
          cat.skills.some((s) => s.id === skillId)
        )
        if (category) {
          const foundSkill = category.skills.find((s) => s.id === skillId)
          if (foundSkill) {
            updatedSelectedSkill = foundSkill
          } else {
            // If skill not found (shouldn't happen), keep the original
            console.warn(`Skill ${skillId} not found after XP update`)
          }
        }
      }
      
      // Always preserve selectedSkill - don't let it become null
      return {
        skillCategories: updatedCategories,
        selectedSkill: updatedSelectedSkill || state.selectedSkill,
        village: updatedVillage,
      }
    }),
  removeXP: (skillId: string, amount: number) =>
    set((state) => {
      const updatedCategories = state.skillCategories.map((cat) => ({
        ...cat,
        skills: cat.skills.map((skill) => {
          if (skill.id === skillId) {
            // Get current cumulative experience
            const currentCumulativeXP = getCumulativeExperience(skill.level) + skill.experience
            // Remove experience (can't go below 0)
            const newCumulativeXP = Math.max(0, currentCumulativeXP - amount)
            // Calculate new level and progress using Melvor formula
            const progress = getExperienceProgress(newCumulativeXP)
            
            return {
              ...skill,
              level: progress.level,
              experience: progress.experience,
              experienceToNext: progress.experienceToNext,
            }
          }
          return skill
        }),
      }))
      
      // Update selectedSkill if it was the one that lost XP
      let updatedSelectedSkill = state.selectedSkill
      if (updatedSelectedSkill?.id === skillId) {
        const category = updatedCategories.find((cat) =>
          cat.skills.some((s) => s.id === skillId)
        )
        if (category) {
          const foundSkill = category.skills.find((s) => s.id === skillId)
          if (foundSkill) {
            updatedSelectedSkill = foundSkill
          }
        }
      }
      
      return {
        skillCategories: updatedCategories,
        selectedSkill: updatedSelectedSkill || state.selectedSkill 
      }
    }),
  startSalvaging: (resourceId: string, duration: number) =>
    set((state) => ({
      activeSalvagingTasks: [
        ...state.activeSalvagingTasks,
        {
          resourceId,
          startTime: Date.now(),
          duration,
          completed: false,
        },
      ],
    })),
  completeSalvagingTask: (taskId: string) =>
    set((state) => ({
      activeSalvagingTasks: state.activeSalvagingTasks.filter((task) => task.resourceId !== taskId),
    })),
  setResourceRespawn: (resourceId: string, respawnTime: number) =>
    set((state) => ({
      resourceRespawns: [
        ...state.resourceRespawns.filter((r) => r.resourceId !== resourceId),
        { resourceId, respawnTime },
      ],
    })),
  incrementGatherCount: (resourceId: string, autoResume = false) =>
    set((state) => {
      const existing = state.resourceGatherCounts.find((g) => g.resourceId === resourceId)
      if (existing) {
        // Preserve autoResume flag if it was already set, or use the new value
        const preservedAutoResume = existing.autoResume || autoResume
        return {
          resourceGatherCounts: state.resourceGatherCounts.map((g) =>
            g.resourceId === resourceId
              ? { ...g, count: g.count + 1, autoResume: preservedAutoResume }
              : g
          ),
        }
      }
      return {
        resourceGatherCounts: [
          ...state.resourceGatherCounts,
          { resourceId, count: 1, autoResume },
        ],
      }
    }),
  resetGatherCount: (resourceId: string) =>
    set((state) => ({
      resourceGatherCounts: state.resourceGatherCounts.map((g) =>
        g.resourceId === resourceId ? { ...g, count: 0 } : g
      ),
    })),
  setAutoResume: (resourceId: string, autoResume: boolean) =>
    set((state) => {
      const existing = state.resourceGatherCounts.find((g) => g.resourceId === resourceId)
      if (existing) {
        return {
          resourceGatherCounts: state.resourceGatherCounts.map((g) =>
            g.resourceId === resourceId ? { ...g, autoResume } : g
          ),
        }
      }
      // Create new entry if it doesn't exist
      return {
        resourceGatherCounts: [
          ...state.resourceGatherCounts,
          { resourceId, count: 0, autoResume },
        ],
      }
    }),
  stopSalvaging: (resourceId: string) =>
    set((state) => {
      // Disable auto-resume for this resource
      const updatedCounts = state.resourceGatherCounts.map((g) =>
        g.resourceId === resourceId ? { ...g, autoResume: false } : g
      )
      // Cancel any active tasks for this resource
      const updatedTasks = state.activeSalvagingTasks.filter(
        (t) => t.resourceId !== resourceId || t.completed
      )
      return {
        resourceGatherCounts: updatedCounts,
        activeSalvagingTasks: updatedTasks,
      }
    }),
  setInventoryOpen: (open: boolean) => set({ inventoryOpen: open }),
  addResourceVeterancyXP: (resourceId: string, amount: number) => {
    try {
      return set((state) => {
        const existing = state.resourceVeterancies.find((rv) => rv.resourceId === resourceId)
        const safeAmount = Math.max(0, amount || 0)
        
        if (existing) {
          const currentTotalXP = getCumulativeResourceVeterancyXP(existing.level) + (existing.experience || 0)
          const newTotalXP = Math.max(0, currentTotalXP + safeAmount)
          const progress = getResourceVeterancyProgress(newTotalXP)
          
          return {
            resourceVeterancies: state.resourceVeterancies.map((rv) =>
              rv.resourceId === resourceId
                ? {
                    ...rv,
                    level: progress.level,
                    experience: progress.experience,
                    experienceToNext: progress.experienceToNext,
                  }
                : rv
            ),
          }
        } else {
          // Create new resource veterancy entry
          const progress = getResourceVeterancyProgress(safeAmount)
          return {
            resourceVeterancies: [
              ...state.resourceVeterancies,
              {
                resourceId,
                level: progress.level,
                experience: progress.experience,
                experienceToNext: progress.experienceToNext,
              },
            ],
          }
        }
      })
    } catch (error) {
      console.error('Error in addResourceVeterancyXP:', error)
      return set((state) => state) // Return unchanged state on error
    }
  },
  addSkillVeterancyXP: (skillId: string, amount: number) => {
    try {
      return set((state) => {
        const existing = state.skillVeterancies.find((sv) => sv.skillId === skillId)
        const safeAmount = Math.max(0, amount || 0)
        
        if (existing) {
          // Add to pool
          const newPool = Math.max(0, (existing.pool || 0) + safeAmount)
          const newLevel = getSkillVeterancyLevelFromPool(newPool)
          const cumulativeXPForLevel = getCumulativeSkillVeterancyXP(newLevel)
          const experience = Math.max(0, newPool - cumulativeXPForLevel)
          const experienceToNext = newLevel < VETERANCY_CONFIG.SKILL_VETERANCY_MAX_LEVEL ? getSkillVeterancyXPForNextLevel(newLevel) : 1
          
          return {
            skillVeterancies: state.skillVeterancies.map((sv) =>
              sv.skillId === skillId
                ? {
                    ...sv,
                    pool: newPool,
                    level: newLevel,
                    experience,
                    experienceToNext,
                  }
                : sv
            ),
          }
        } else {
          // Create new skill veterancy entry
          const newLevel = getSkillVeterancyLevelFromPool(safeAmount)
          const cumulativeXPForLevel = getCumulativeSkillVeterancyXP(newLevel)
          const experience = Math.max(0, safeAmount - cumulativeXPForLevel)
          const experienceToNext = newLevel < VETERANCY_CONFIG.SKILL_VETERANCY_MAX_LEVEL ? getSkillVeterancyXPForNextLevel(newLevel) : 1
          
          return {
            skillVeterancies: [
              ...state.skillVeterancies,
              {
                skillId,
                pool: safeAmount,
                level: newLevel,
                experience,
                experienceToNext,
              },
            ],
          }
        }
      })
    } catch (error) {
      console.error('Error in addSkillVeterancyXP:', error)
      return set((state) => state) // Return unchanged state on error
    }
  },
  convertSkillVeterancyToResource: (skillId: string, resourceId: string, amount: number) => {
    try {
      return set((state) => {
        const skillVeterancy = state.skillVeterancies.find((sv) => sv.skillId === skillId)
        if (!skillVeterancy || (skillVeterancy.pool || 0) < amount) {
          return state // Not enough pool XP
        }
        
        // Remove from skill veterancy pool
        const newPool = Math.max(0, (skillVeterancy.pool || 0) - amount)
        const newLevel = getSkillVeterancyLevelFromPool(newPool)
        const cumulativeXPForLevel = getCumulativeSkillVeterancyXP(newLevel)
        const experience = Math.max(0, newPool - cumulativeXPForLevel)
          const experienceToNext = newLevel < VETERANCY_CONFIG.SKILL_VETERANCY_MAX_LEVEL ? getSkillVeterancyXPForNextLevel(newLevel) : 1
        
        // Convert to resource veterancy (10:1 ratio)
        const resourceXPAmount = Math.floor(amount / VETERANCY_CONFIG.SKILL_TO_RESOURCE_CONVERSION)
        
        const updatedSkillVeterancies = state.skillVeterancies.map((sv) =>
          sv.skillId === skillId
            ? {
                ...sv,
                pool: newPool,
                level: newLevel,
                experience,
                experienceToNext,
              }
            : sv
        )
        
        // Add to resource veterancy
        const existingResource = state.resourceVeterancies.find((rv) => rv.resourceId === resourceId)
        
        let updatedResourceVeterancies = state.resourceVeterancies
        if (existingResource) {
          const currentTotalXP = getCumulativeResourceVeterancyXP(existingResource.level) + (existingResource.experience || 0)
          const newTotalXP = Math.max(0, currentTotalXP + resourceXPAmount)
          const progress = getResourceVeterancyProgress(newTotalXP)
          
          updatedResourceVeterancies = state.resourceVeterancies.map((rv) =>
            rv.resourceId === resourceId
              ? {
                  ...rv,
                  level: progress.level,
                  experience: progress.experience,
                  experienceToNext: progress.experienceToNext,
                }
              : rv
          )
        } else {
          const progress = getResourceVeterancyProgress(resourceXPAmount)
          updatedResourceVeterancies = [
            ...state.resourceVeterancies,
            {
              resourceId,
              level: progress.level,
              experience: progress.experience,
              experienceToNext: progress.experienceToNext,
            },
          ]
        }
        
        return {
          skillVeterancies: updatedSkillVeterancies,
          resourceVeterancies: updatedResourceVeterancies,
        }
      })
    } catch (error) {
      console.error('Error in convertSkillVeterancyToResource:', error)
      return set((state) => state) // Return unchanged state on error
    }
  },
  startEngineering: (recipeId: string, duration: number, autoResume: boolean) =>
    set((state) => ({
      activeEngineeringTasks: [
        ...state.activeEngineeringTasks.filter((task) => task.recipeId !== recipeId),
        {
          recipeId,
          startTime: Date.now(),
          duration,
          completed: false,
          autoResume,
        },
      ],
    })),
  completeEngineeringTask: (recipeId: string) =>
    set((state) => ({
      activeEngineeringTasks: state.activeEngineeringTasks.map((task) =>
        task.recipeId === recipeId ? { ...task, completed: true } : task
      ),
    })),
  stopEngineering: (recipeId: string) =>
    set((state) => ({
      activeEngineeringTasks: state.activeEngineeringTasks.filter((task) => task.recipeId !== recipeId),
    })),
  startMedicaeResearch: (topicId: string, duration: number, autoResume: boolean) =>
    set((state) => ({
      activeMedicaeResearchTasks: [
        ...state.activeMedicaeResearchTasks.filter((task) => task.topicId !== topicId),
        {
          topicId,
          startTime: Date.now(),
          duration,
          completed: false,
          autoResume,
        },
      ],
    })),
  completeMedicaeResearchTask: (topicId: string) =>
    set((state) => ({
      activeMedicaeResearchTasks: state.activeMedicaeResearchTasks.map((task) =>
        task.topicId === topicId ? { ...task, completed: true } : task
      ),
    })),
  stopMedicaeResearch: (topicId: string) =>
    set((state) => ({
      activeMedicaeResearchTasks: state.activeMedicaeResearchTasks.filter((task) => task.topicId !== topicId),
    })),
  addKnowledgePoints: (amount: number) =>
    set((state) => ({ knowledgePoints: state.knowledgePoints + amount })),
  unlockMedicaeSkill: (skillId: string) =>
    set((state) => ({
      unlockedMedicaeSkills: state.unlockedMedicaeSkills.includes(skillId)
        ? state.unlockedMedicaeSkills
        : [...state.unlockedMedicaeSkills, skillId],
    })),
  addCombatSubStatXP: (statType: 'strength' | 'attack' | 'defence' | 'agility', amount: number) =>
    set((state) => {
      const currentStat = state.combatSubStats[statType]
      const currentCumulativeXP = getCumulativeExperience(currentStat.level) + currentStat.experience
      const newCumulativeXP = currentCumulativeXP + amount
      const progress = getExperienceProgress(newCumulativeXP)
      
      return {
        combatSubStats: {
          ...state.combatSubStats,
          [statType]: {
            level: progress.level,
            experience: progress.experience,
            experienceToNext: progress.experienceToNext,
          },
        },
      }
    }),
  removeCombatSubStatXP: (statType: 'strength' | 'attack' | 'defence' | 'agility', amount: number) =>
    set((state) => {
      const currentStat = state.combatSubStats[statType]
      const currentCumulativeXP = getCumulativeExperience(currentStat.level) + currentStat.experience
      const newCumulativeXP = Math.max(0, currentCumulativeXP - amount)
      const progress = getExperienceProgress(newCumulativeXP)
      
      return {
        combatSubStats: {
          ...state.combatSubStats,
          [statType]: {
            level: progress.level,
            experience: progress.experience,
            experienceToNext: progress.experienceToNext,
          },
        },
      }
    }),
  startContact: (planetId: string, duration: number) =>
    set((state) => ({
      activeContactTasks: [
        ...state.activeContactTasks,
        {
          planetId,
          startTime: Date.now(),
          duration,
          completed: false,
        },
      ],
    })),
  completeContactTask: (planetId: string) =>
    set((state) => ({
      activeContactTasks: state.activeContactTasks.filter((task) => task.planetId !== planetId),
    })),
  discoverPlanet: (planetId: string) =>
    set((state) => ({
      planets: state.planets.map((planet) =>
        planet.id === planetId ? { ...planet, discovered: true } : planet
      ),
    })),
  updatePlanetTradeItems: (planetId: string, tradeItems: Planet['tradeItems']) =>
    set((state) => ({
      planets: state.planets.map((planet) =>
        planet.id === planetId ? { ...planet, tradeItems } : planet
      ),
    })),
  setPlanetRotation: (planetId: string, nextRotation: number) =>
    set((state) => ({
      planets: state.planets.map((planet) =>
        planet.id === planetId ? { ...planet, nextRotation } : planet
      ),
    })),
  startBuildingConstruction: (buildingType: BuildingDefinition['id']) =>
    set((state) => {
      const colonySkill = state.skillCategories
        .flatMap((cat) => cat.skills)
        .find((s) => s.id === 'colony')
      const colonyLevel = colonySkill?.level || 1

      // Reset daily limits if needed
      let village = { ...state.village }
      if (shouldResetDailyLimits(village.dailyLimits.lastReset)) {
        const maxConstructions = getMaxDailyConstructions(colonyLevel)
        const maxRecruits = getMaxDailyRecruits(colonyLevel)
        village.dailyLimits = {
          constructions: maxConstructions,
          constructionsUsed: 0,
          lastReset: Date.now(),
          recruits: maxRecruits,
          recruitsUsed: 0,
        }
      }

                  // Daily limits removed - only City Hall building limit applies

      const definition = BUILDING_DEFINITIONS.find((d) => d.id === buildingType)
      if (!definition || definition.levelRequired > colonyLevel) {
        state.addNotification(`Cannot build ${definition?.name || 'building'}: Level ${definition?.levelRequired || 0} required`)
        return state
      }

      // Check if this building requires a base building
      if (definition.requiresBaseBuilding) {
        const hasBaseBuilding = village.buildings.some(
          (b) => b.type === definition.requiresBaseBuilding && b.completed
        )
        if (!hasBaseBuilding) {
          const baseDef = BUILDING_DEFINITIONS.find((d) => d.id === definition.requiresBaseBuilding)
          state.addNotification(`Cannot build ${definition.name}: Requires ${baseDef?.name || 'base building'} to be built first`)
          return state
        }
      }

      // Check if this is a main building (unlocks specialized buildings) - only allow one
      if (definition.unlocksSpecializedBuildings) {
        const existingMainBuilding = village.buildings.find((b) => b.type === buildingType)
        if (existingMainBuilding) {
          state.addNotification(`You can only build one ${definition.name}. Upgrade it instead!`)
          return state
        }
      }

      // Count existing buildings of this type
      const buildingCount = village.buildings.filter((b) => b.type === buildingType).length
      const cost = calculateBuildingCost(definition.baseCost, buildingCount, definition.tier)

      // Check resources
      if (village.resources.wood < cost.wood || village.resources.stone < cost.stone) {
        state.addNotification(`Insufficient resources! Need ${cost.wood} wood, ${cost.stone} stone`)
        return state
      }

      // Check total building limit based on City Hall level
      const maxBuildingLimit = getMaxBuildingLimit(village.buildings)
      const totalBuildings = village.buildings.filter((b) => b.completed).length + village.constructionQueue.length
      if (totalBuildings >= maxBuildingLimit) {
        state.addNotification(`Building limit reached! (${totalBuildings}/${maxBuildingLimit}). Upgrade City Hall to increase limit.`)
        return state
      }
      
      // Check construction queue limit (max 3)
      if (village.constructionQueue.length >= 3) {
        state.addNotification('Construction queue is full! (max 3 buildings at once)')
        return state
      }

      // Create building
      // Use baseConstructionTime from definition (in seconds), convert to milliseconds
      const constructionTime = definition.baseConstructionTime * 1000
      const xpReward = calculateBuildingXP(cost, definition.tier, false)
      const building: Building = {
        id: `${buildingType}-${Date.now()}-${Math.random()}`,
        type: buildingType,
        level: 1,
        assignedVillagers: [],
        constructionStartTime: Date.now(),
        constructionDuration: constructionTime,
        completed: false,
        xpReward,
      }

      // Deduct resources and add to queue
      village.resources.wood -= cost.wood
      village.resources.stone -= cost.stone
      village.constructionQueue.push(building)

      state.addNotification(`Started building ${definition.name}`)
      return { village }
    }),
  completeBuildingConstruction: (buildingId: string) =>
    set((state) => {
      const village = { ...state.village }
      const buildingIndex = village.constructionQueue.findIndex((b) => b.id === buildingId)
      if (buildingIndex === -1) return state

      const building = village.constructionQueue[buildingIndex]
      const now = Date.now()
      if (building.constructionStartTime && now - building.constructionStartTime >= building.constructionDuration) {
        // Construction complete
        const completedBuilding: Building = {
          ...building,
          completed: true,
          constructionStartTime: null,
          lastCollectionTime: now, // Start tracking from completion
          accumulatedResources: 0, // Start with 0 accumulated resources
        }
        village.buildings.push(completedBuilding)
        village.constructionQueue.splice(buildingIndex, 1)

        // Award XP
        state.addXP('colony', completedBuilding.xpReward)
        state.addNotification(`${BUILDING_DEFINITIONS.find((d) => d.id === building.type)?.name || 'Building'} construction complete!`)

        return { village }
      }
      return state
    }),
  recruitVillager: (villagerType: VillagerType) =>
    set((state) => {
      const village = { ...state.village }

      // Reset daily limits if needed
      const colonySkill = state.skillCategories
        .flatMap((cat) => cat.skills)
        .find((s) => s.id === 'colony')
      const colonyLevel = colonySkill?.level || 1

      if (shouldResetDailyLimits(village.dailyLimits.lastReset)) {
        const maxRecruits = getMaxDailyRecruits(colonyLevel)
        village.dailyLimits.recruits = maxRecruits
        village.dailyLimits.recruitsUsed = 0
        village.dailyLimits.lastReset = Date.now()
      }

      // Check daily limit
      if (village.dailyLimits.recruitsUsed >= village.dailyLimits.recruits) {
        state.addNotification('Daily recruitment limit reached!')
        return state
      }

      const villagerData = VILLAGER_TYPES[villagerType]
      if (village.resources.food < villagerData.recruitmentCost) {
        state.addNotification(`Insufficient food! Need ${villagerData.recruitmentCost} food`)
        return state
      }

      // Check housing capacity
      const totalHousing = village.buildings
        .filter((b) => b.type === 'hut' || b.type === 'stone-house' || b.type === 'barracks')
        .reduce((total, b) => {
          const def = BUILDING_DEFINITIONS.find((d) => d.id === b.type)
          return total + (def?.housingCapacity || 0)
        }, 0)

      if (village.villagers.length >= totalHousing) {
        state.addNotification('Not enough housing! Build more huts or houses')
        return state
      }

      // Create villager
      const villager: Villager = {
        id: `villager-${Date.now()}-${Math.random()}`,
        name: `${villagerData.name} ${village.villagers.length + 1}`,
        type: villagerType,
        assignedBuilding: null,
        efficiency: villagerData.baseEfficiency,
        foodConsumption: 1, // 1 food per hour
        recruitmentCost: villagerData.recruitmentCost,
        xpReward: villagerData.xpReward,
      }

      village.resources.food -= villagerData.recruitmentCost
      village.villagers.push(villager)
      village.dailyLimits.recruitsUsed++

      state.addXP('colony', villagerData.xpReward)
      state.addNotification(`Recruited ${villagerData.name}!`)

      return { village }
    }),
  assignVillagerToBuilding: (villagerId: string, buildingId: string | null) =>
    set((state) => {
      const village = { ...state.village }
      const villager = village.villagers.find((v) => v.id === villagerId)
      if (!villager) return state

      // Unassign from previous building
      if (villager.assignedBuilding) {
        const prevBuilding = village.buildings.find((b) => b.id === villager.assignedBuilding)
        if (prevBuilding) {
          prevBuilding.assignedVillagers = prevBuilding.assignedVillagers.filter((id) => id !== villagerId)
        }
      }

      // Assign to new building (free assignment/unassignment for all workers)
      if (buildingId) {
        const building = village.buildings.find((b) => b.id === buildingId)
        if (building && building.completed) {
          const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
          if (definition && definition.maxWorkers > 0) {
            // Check if building has space using level-based max workers
            const maxWorkers = getMaxWorkersForLevel(definition.maxWorkers, building.level)
            if (building.assignedVillagers.length < maxWorkers) {
              building.assignedVillagers.push(villagerId)
              villager.assignedBuilding = buildingId
            } else {
              state.addNotification('Building is full!')
            }
          }
        }
      } else {
        // Unassign - completely free, no restrictions
        villager.assignedBuilding = null
      }

      return { village }
    }),
  collectBuildingResources: (buildingId: string) =>
    set((state) => {
      const village = { ...state.village }
      const building = village.buildings.find((b) => b.id === buildingId)
      if (!building || !building.completed) return state

      const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
      if (!definition?.production) return state

      // Check if villagers are assigned
      const assignedVillagers = village.villagers.filter((v) => building.assignedVillagers.includes(v.id))
      if (assignedVillagers.length === 0) {
        state.addNotification('Assign workers to this building to produce resources!')
        return state
      }

      // Check if there are resources ready to collect
      if (building.accumulatedResources <= 0) {
        state.addNotification('No resources ready to collect yet')
        return state
      }

      const collected = Math.floor(building.accumulatedResources)
      const resourceId = definition.production.resource
      
      // Check if this is a village resource (wood/stone) or main inventory resource (food/herbs)
      if (resourceId === 'village-wood') {
        village.resources.wood = Math.min(village.resources.wood + collected, village.storageCapacity.wood)
        state.addNotification(`Collected ${collected} wood from ${definition.name}`)
      } else if (resourceId === 'village-stone') {
        village.resources.stone = Math.min(village.resources.stone + collected, village.storageCapacity.stone)
        state.addNotification(`Collected ${collected} stone from ${definition.name}`)
      } else if (resourceId === 'village-food') {
        village.resources.food = Math.min(village.resources.food + collected, village.storageCapacity.food)
        state.addNotification(`Collected ${collected} food from ${definition.name}`)
      } else if (resourceId === 'village-herbs') {
        village.resources.herbs = Math.min(village.resources.herbs + collected, village.storageCapacity.herbs)
        state.addNotification(`Collected ${collected} herbs from ${definition.name}`)
      } else {
        // Food/herb resources go to MAIN inventory for Food Production/Apothecary
        state.addResource(resourceId, collected)
        state.addNotification(`Collected ${collected} ${resourceId} from ${definition.name}`)
      }

      // Award XP based on resources collected (1 XP per resource, minimum 1 XP)
      const xpReward = Math.max(1, collected)
      state.addXP('colony', xpReward)

      // Reset accumulated resources and update collection time
      building.accumulatedResources = 0
      building.lastCollectionTime = Date.now()

      return { village }
    }),
  updateBuildingProduction: () =>
    set((state) => {
      const village = { ...state.village }
      const now = Date.now()

      village.buildings.forEach((building) => {
        if (!building.completed) return
        
        const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
        if (!definition?.production) return

        const assignedVillagers = village.villagers.filter((v) =>
          building.assignedVillagers.includes(v.id)
        )
        if (assignedVillagers.length === 0) return

        // Calculate effective production rate using new formulas
        const baseRate = definition.production.rate // per hour
        const effectiveRate = calculateEffectiveProductionRate(
          baseRate,
          building.level,
          assignedVillagers,
          assignedVillagers.length
        )

        // Calculate time since last update
        const lastUpdate = building.lastCollectionTime || now
        const hoursElapsed = (now - lastUpdate) / (1000 * 60 * 60) // Convert to hours

        // Accumulate resources (capped at storage capacity)
        const maxStorage = definition.production.storageCapacity
        const currentAccumulated = building.accumulatedResources || 0
        const newAccumulated = currentAccumulated + (effectiveRate * hoursElapsed)
        
        building.accumulatedResources = Math.min(newAccumulated, maxStorage)
        building.lastCollectionTime = now
      })

      return { village }
    }),
  upgradeBuilding: (buildingId: string) =>
    set((state) => {
      const village = { ...state.village }
      const building = village.buildings.find((b) => b.id === buildingId)
      if (!building || !building.completed) return state

      const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
      if (!definition) return state

      // City Hall upgrade logic
      if (building.type === 'city-hall') {
        // Calculate upgrade cost (increases with level)
        // Level 1->2: only wood, Level 2->3: only wood, Level 3+: wood + stone
        const upgradeCost = {
          wood: building.level * 50,
          stone: building.level >= 3 ? building.level * 30 : 0, // Stone only needed from level 3+
        }

        // Check resources
        if (village.resources.wood < upgradeCost.wood) {
          state.addNotification(`Insufficient resources! Need ${upgradeCost.wood} wood`)
          return state
        }
        if (upgradeCost.stone > 0 && village.resources.stone < upgradeCost.stone) {
          state.addNotification(`Insufficient resources! Need ${upgradeCost.wood} wood, ${upgradeCost.stone} stone`)
          return state
        }

        // Deduct resources
        village.resources.wood -= upgradeCost.wood
        if (upgradeCost.stone > 0) {
          village.resources.stone -= upgradeCost.stone
        }

        // Upgrade building level
        building.level += 1

        // Award XP based on upgrade cost
        const xpReward = (upgradeCost.wood + upgradeCost.stone) * 0.5
        state.addXP('colony', xpReward)

        const newBuildingLimit = getMaxBuildingLimit(village.buildings)
        state.addNotification(`City Hall upgraded to Level ${building.level}! Building limit increased to ${newBuildingLimit}.`)
        return { village }
      }

      // Production building upgrade logic (food/herb buildings)
      if (definition.production) {
        // Calculate upgrade cost using production building formula
        const upgradeCost = calculateProductionBuildingUpgradeCost(definition.baseCost, building.level)

        // Check resources
        if (village.resources.wood < upgradeCost.wood) {
          state.addNotification(`Insufficient resources! Need ${upgradeCost.wood} wood`)
          return state
        }
        if (village.resources.stone < upgradeCost.stone) {
          state.addNotification(`Insufficient resources! Need ${upgradeCost.wood} wood, ${upgradeCost.stone} stone`)
          return state
        }

        // Deduct resources
        village.resources.wood -= upgradeCost.wood
        village.resources.stone -= upgradeCost.stone

        // Upgrade building level
        building.level += 1

        // Update max workers if needed (workers may need to be unassigned if new max is lower)
        const newMaxWorkers = getMaxWorkersForLevel(definition.maxWorkers, building.level)
        if (building.assignedVillagers.length > newMaxWorkers) {
          // Unassign excess workers
          const excessCount = building.assignedVillagers.length - newMaxWorkers
          for (let i = 0; i < excessCount; i++) {
            const villagerId = building.assignedVillagers.pop()
            if (villagerId) {
              const villager = village.villagers.find((v) => v.id === villagerId)
              if (villager) {
                villager.assignedBuilding = null
              }
            }
          }
        }

        // Award XP based on upgrade cost
        const xpReward = calculateBuildingXP(upgradeCost, definition.tier, true)
        state.addXP('colony', xpReward)

        const levelMultiplier = 1 + (building.level - 1) * 0.15
        const newMaxWorkersDisplay = getMaxWorkersForLevel(definition.maxWorkers, building.level)
        state.addNotification(
          `${definition.name} upgraded to Level ${building.level}! ` +
          `Production: +${Math.round((levelMultiplier - 1) * 100)}%, ` +
          `Max Workers: ${newMaxWorkersDisplay}`
        )
        return { village }
      }

      // Other buildings cannot be upgraded yet
      state.addNotification('This building cannot be upgraded')
      return state
    }),
  cheatCompleteBuilding: (buildingId: string) =>
    set((state) => {
      const village = { ...state.village }
      const buildingIndex = village.constructionQueue.findIndex((b) => b.id === buildingId)
      if (buildingIndex === -1) return state

      const building = village.constructionQueue[buildingIndex]
      const now = Date.now()
      
      // Instantly complete the building
      const completedBuilding: Building = {
        ...building,
        completed: true,
        constructionStartTime: null,
        lastCollectionTime: now,
        accumulatedResources: 0,
      }
      village.buildings.push(completedBuilding)
      village.constructionQueue.splice(buildingIndex, 1)

      // Award XP
      state.addXP('colony', completedBuilding.xpReward)
      state.addNotification(`[CHEAT] ${BUILDING_DEFINITIONS.find((d) => d.id === building.type)?.name || 'Building'} instantly completed!`)

      return { village }
    }),
  cheatAddVillageResource: (resource: 'wood' | 'stone' | 'food' | 'herbs', amount: number) =>
    set((state) => {
      const village = { ...state.village }
      village.resources[resource] = Math.min(
        village.resources[resource] + amount,
        village.storageCapacity[resource]
      )
      state.addNotification(`[CHEAT] Added ${amount} ${resource}`)
      return { village }
    }),
  cheatAddWorker: () =>
    set((state) => {
      const village = { ...state.village }
      const now = Date.now()
      const workerData = VILLAGER_TYPES.worker
      
      const newWorker: Villager = {
        id: `villager-cheat-${now}-${Math.random()}`,
        name: `Worker ${village.villagers.length + 1}`,
        type: 'worker',
        assignedBuilding: null,
        efficiency: 1.0,
        foodConsumption: workerData.foodConsumption,
        recruitmentCost: 0,
        xpReward: 0,
      }
      
      village.villagers.push(newWorker)
      state.addNotification('[CHEAT] Added 1 worker')
      return { village }
    }),
  setEquippedItem: (slotKey: string, itemId: string | null) =>
    set((state) => {
      if (itemId === null) {
        const { [slotKey]: _, ...rest } = state.equippedItems
        return { equippedItems: rest }
      }
      return {
        equippedItems: {
          ...state.equippedItems,
          [slotKey]: itemId,
        },
      }
    }),
  setCombatActive: (active: boolean) => set({ combatActive: active }),
  setSelectedEnemy: (enemy: Enemy | null) => set({ selectedEnemy: enemy }),
  purchaseFarmingPlot: () =>
    set((state) => {
      const plotCost = 100 * (state.farmingPlots.length + 1) // Increasing cost per plot
      if (state.gold < plotCost) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: `${Date.now()}-${Math.random()}`,
              message: `Not enough gold! Need ${plotCost.toLocaleString()} gold.`,
              timestamp: Date.now(),
            },
          ],
        }
      }
      const newPlot: FarmingPlot = {
        id: `plot-${Date.now()}-${Math.random()}`,
        purchased: true,
        plantedSeedId: null,
        plantedAt: null,
        readyAt: null,
      }
      return {
        gold: state.gold - plotCost,
        farmingPlots: [...state.farmingPlots, newPlot],
        notifications: [
          ...state.notifications,
          {
            id: `${Date.now()}-${Math.random()}`,
            message: `Purchased farming plot for ${plotCost.toLocaleString()} gold!`,
            timestamp: Date.now(),
          },
        ],
      }
    }),
  plantSeed: (plotId: string, seedId: string) =>
    set((state) => {
      const plot = state.farmingPlots.find((p) => p.id === plotId)
      if (!plot) return state
      if (plot.plantedSeedId) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: `${Date.now()}-${Math.random()}`,
              message: 'This plot already has a crop planted!',
              timestamp: Date.now(),
            },
          ],
        }
      }
      
      // Check if player has the seed in inventory
      const seedCount = state.resources[seedId] || 0
      if (seedCount < 1) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: `${Date.now()}-${Math.random()}`,
              message: `You don't have any ${seedId.replace('-seed', '')} seeds!`,
              timestamp: Date.now(),
            },
          ],
        }
      }
      
      // Get seed data
      const seed = getSeedById(seedId)
      if (!seed) return state
      
      const now = Date.now()
      const readyAt = now + seed.growTime * 1000
      
      const updatedPlots = state.farmingPlots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              plantedSeedId: seedId,
              plantedAt: now,
              readyAt,
            }
          : p
      )
      
      // Remove seed from inventory
      const updatedResources = {
        ...state.resources,
        [seedId]: Math.max(0, seedCount - 1),
      }
      
      return {
        farmingPlots: updatedPlots,
        resources: updatedResources,
        notifications: [
          ...state.notifications,
          {
            id: `${Date.now()}-${Math.random()}`,
            message: `Planted ${seed.name}!`,
            timestamp: Date.now(),
          },
        ],
      }
    }),
  harvestCrop: (plotId: string) =>
    set((state) => {
      const plot = state.farmingPlots.find((p) => p.id === plotId)
      if (!plot || !plot.plantedSeedId || !plot.readyAt) return state
      
      if (Date.now() < plot.readyAt) {
        const remaining = Math.ceil((plot.readyAt - Date.now()) / 1000)
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: `${Date.now()}-${Math.random()}`,
              message: `Crop not ready yet! ${remaining}s remaining.`,
              timestamp: Date.now(),
            },
          ],
        }
      }
      
      const seed = getSeedById(plot.plantedSeedId)
      if (!seed) return state
      
      // Give rewards
      const updatedResources = {
        ...state.resources,
        [seed.cropId]: (state.resources[seed.cropId] || 0) + seed.yield,
      }
      
      // Update skill XP
      const updatedCategories = state.skillCategories.map((cat) => ({
        ...cat,
        skills: cat.skills.map((skill) => {
          if (skill.id === 'farming') {
            const currentCumulativeXP = getCumulativeExperience(skill.level) + skill.experience
            const newCumulativeXP = currentCumulativeXP + seed.xpReward
            const progress = getExperienceProgress(newCumulativeXP)
            return {
              ...skill,
              level: progress.level,
              experience: progress.experience,
              experienceToNext: progress.experienceToNext,
            }
          }
          return skill
        }),
      }))
      
      // Update selectedSkill if it's farming
      let updatedSelectedSkill = state.selectedSkill
      if (updatedSelectedSkill?.id === 'farming') {
        const category = updatedCategories.find((cat) =>
          cat.skills.some((s) => s.id === 'farming')
        )
        if (category) {
          const foundSkill = category.skills.find((s) => s.id === 'farming')
          if (foundSkill) {
            updatedSelectedSkill = foundSkill
          }
        }
      }
      
      // Clear plot
      const updatedPlots = state.farmingPlots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              plantedSeedId: null,
              plantedAt: null,
              readyAt: null,
            }
          : p
      )
      
      return {
        farmingPlots: updatedPlots,
        resources: updatedResources,
        skillCategories: updatedCategories,
        selectedSkill: updatedSelectedSkill || state.selectedSkill,
        notifications: [
          ...state.notifications,
          {
            id: `${Date.now()}-${Math.random()}`,
            message: `${seed.name.replace(' Seeds', '')} +${seed.yield} (harvested)`,
            timestamp: Date.now(),
          },
        ],
      }
    }),
  logout: () => {
    set({ authenticated: false, user: null, connected: false })
  },
}))
