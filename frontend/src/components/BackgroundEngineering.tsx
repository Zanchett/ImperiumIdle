import { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { ENGINEERING_RECIPES } from '../types/engineeringResources'
import { getSpeedBonus, getSkillVeterancySpecialBonuses } from '../utils/veterancy'

/**
 * Background component that handles engineering logic continuously,
 * regardless of which view is active
 */
export default function BackgroundEngineering() {
  const {
    addResource,
    removeResource,
    addXP,
    startEngineering,
    completeEngineeringTask,
    activeEngineeringTasks,
    resources,
    addNotification,
    addSkillVeterancyXP,
    addResourceVeterancyXP,
    skillVeterancies,
    resourceVeterancies,
  } = useGameStore()

  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update time every 100ms for smooth progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Check for completed engineering tasks and cancel tasks with insufficient resources
  useEffect(() => {
    activeEngineeringTasks.forEach((task) => {
      if (task.completed) return

      const recipe = ENGINEERING_RECIPES.find((r) => r.id === task.recipeId)
      if (!recipe) return

      // Check if player has enough ingredients
      const hasIngredients = recipe.ingredients.every(
        (ingredient) => (resources[ingredient.resourceId] || 0) >= ingredient.amount
      )

      // If resources become unavailable during crafting, cancel the task
      if (!hasIngredients) {
        completeEngineeringTask(task.recipeId)
        return
      }

      const elapsed = currentTime - task.startTime
      if (elapsed >= task.duration) {
        // Get veterancy bonuses
        const recipeVeterancy = resourceVeterancies.find((rv) => rv.resourceId === recipe.id)
        const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'engineering')
        const recipeVeterancyLevel = recipeVeterancy?.level || 0
        const skillVeterancyLevel = skillVeterancy?.level || 0
        const specialBonuses = getSkillVeterancySpecialBonuses('engineering', skillVeterancyLevel)
        
        // Material save chance: chance to not consume ingredients
        const materialSaveChance = specialBonuses.materialSave || 0
        const materialSave = Math.random() * 100 < materialSaveChance
        
        // Consume ingredients (unless saved by veterancy)
        if (!materialSave) {
          recipe.ingredients.forEach((ingredient) => {
            removeResource(ingredient.resourceId, ingredient.amount)
          })
        }

        // Calculate XP bonus from veterancy
        const xpBonus = specialBonuses.xpBonus || 0
        const baseXP = recipe.xpReward
        const finalXP = Math.floor(baseXP * (1 + xpBonus / 100))

        // Add result (crafted item as a resource)
        addResource(recipe.id, 1)
        addXP('engineering', finalXP)
        
        // Award veterancy XP
        // Recipe veterancy: 1:1 ratio with skill XP
        addResourceVeterancyXP(recipe.id, finalXP)
        // Skill veterancy: 0.5:1 ratio with skill XP
        addSkillVeterancyXP('engineering', Math.floor(finalXP * 0.5))
        
        // Show notification
        let notificationText = `${recipe.name} +1`
        if (materialSave) {
          notificationText += ' (materials saved!)'
        }
        addNotification(notificationText)

        // Mark as completed
        completeEngineeringTask(task.recipeId)

        // Auto-resume if enabled
        if (task.autoResume) {
          // Check ingredients again before resuming
          const stillHasIngredients = recipe.ingredients.every(
            (ingredient) => (resources[ingredient.resourceId] || 0) >= ingredient.amount
          )
          
          if (stillHasIngredients) {
            // Apply speed bonus from skill veterancy
            const speedBonus = getSpeedBonus(skillVeterancyLevel)
            const baseDuration = recipe.time * 1000
            const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
            startEngineering(recipe.id, duration, true)
          }
        }
      }
    })
  }, [
    currentTime,
    activeEngineeringTasks,
    resources,
    addResource,
    removeResource,
    addXP,
    addNotification,
    startEngineering,
    completeEngineeringTask,
    addSkillVeterancyXP,
    addResourceVeterancyXP,
    skillVeterancies,
    resourceVeterancies,
  ])

  // This component doesn't render anything - it just runs in the background
  return null
}

