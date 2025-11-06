import { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SMELTING_RECIPES } from '../types/smeltingResources'
import { getSpeedBonus, getSkillVeterancySpecialBonuses } from '../utils/veterancy'

/**
 * Background component that handles smelting logic continuously,
 * regardless of which view is active
 */
export default function BackgroundSmelting() {
  const {
    addResource,
    removeResource,
    addXP,
    startSmelting,
    completeSmeltingTask,
    activeSmeltingTasks,
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

  // Check for completed smelting tasks and cancel tasks with insufficient resources
  useEffect(() => {
    activeSmeltingTasks.forEach((task) => {
      if (task.completed) return

      const recipe = SMELTING_RECIPES.find((r) => r.id === task.recipeId)
      if (!recipe) return

      // Check if player has enough ingredients
      const hasIngredients = recipe.ingredients.every(
        (ingredient) => (resources[ingredient.resourceId] || 0) >= ingredient.amount
      )

      // If resources become unavailable during smelting, cancel the task
      if (!hasIngredients) {
        completeSmeltingTask(task.recipeId)
        return
      }

      const elapsed = currentTime - task.startTime
      if (elapsed >= task.duration) {
        // Get veterancy bonuses
        const recipeVeterancy = resourceVeterancies.find((rv) => rv.resourceId === recipe.id)
        const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'smelting')
        const recipeVeterancyLevel = recipeVeterancy?.level || 0
        const skillVeterancyLevel = skillVeterancy?.level || 0
        const specialBonuses = getSkillVeterancySpecialBonuses('smelting', skillVeterancyLevel)
        
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

        // Add result (smelted metal as a resource)
        addResource(recipe.id, 1)
        addXP('smelting', finalXP)
        
        // Award veterancy XP
        // Recipe veterancy: 1:1 ratio with skill XP
        addResourceVeterancyXP(recipe.id, finalXP)
        // Skill veterancy: 0.5:1 ratio with skill XP
        addSkillVeterancyXP('smelting', Math.floor(finalXP * 0.5))
        
        // Show notification
        let notificationText = `${recipe.name} +1`
        if (materialSave) {
          notificationText += ' (materials saved!)'
        }
        addNotification(notificationText)

        // Mark as completed
        completeSmeltingTask(task.recipeId)

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
            startSmelting(recipe.id, duration, true)
          }
        }
      }
    })
  }, [
    currentTime,
    activeSmeltingTasks,
    resources,
    addResource,
    removeResource,
    addXP,
    addNotification,
    startSmelting,
    completeSmeltingTask,
    addSkillVeterancyXP,
    addResourceVeterancyXP,
    skillVeterancies,
    resourceVeterancies,
  ])

  // This component doesn't render anything - it just runs in the background
  return null
}

