import { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SALVAGING_RESOURCES } from '../types/salvagingResources'
import {
  calculateExtraResources,
  getGatherLimitIncrease,
  getSpeedBonus,
} from '../utils/veterancy'

const BASE_MAX_GATHERS_PER_RESOURCE = 10

/**
 * Background component that handles gathering logic continuously,
 * regardless of which view is active (skills, inventory, etc.)
 */
export default function BackgroundGathering() {
  const {
    addResource,
    addXP,
    startSalvaging,
    completeSalvagingTask,
    activeSalvagingTasks,
    resourceRespawns,
    resourceGatherCounts,
    setResourceRespawn,
    incrementGatherCount,
    resetGatherCount,
    setAutoResume,
    addNotification,
    addResourceVeterancyXP,
    addSkillVeterancyXP,
    resourceVeterancies,
    skillVeterancies,
  } = useGameStore()

  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update time every 100ms for smooth progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Auto-resume gathering when respawn completes
  useEffect(() => {
    resourceGatherCounts.forEach((gatherCount) => {
      if (gatherCount.autoResume) {
        const respawn = resourceRespawns.find((r) => r.resourceId === gatherCount.resourceId)
        if (respawn && currentTime >= respawn.respawnTime) {
          // Respawn completed, check if we can resume
          const resource = SALVAGING_RESOURCES.find((r) => r.id === gatherCount.resourceId)
          if (resource) {
            const activeTask = activeSalvagingTasks.find(
              (t) => t.resourceId === gatherCount.resourceId && !t.completed
            )
            // Continue gathering regardless of which skill is selected or which view is active
            if (!activeTask) {
              // Auto-resume gathering - no skill level check needed as we already started it
              // Apply speed bonus from skill veterancy
              const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'salvaging')
              const skillVeterancyLevel = skillVeterancy?.level || 0
              const speedBonus = getSpeedBonus(skillVeterancyLevel)
              const baseDuration = resource.baseTime * 1000
              const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
              startSalvaging(resource.id, duration)
            }
          }
        }
      }
    })
  }, [currentTime, resourceRespawns, resourceGatherCounts, activeSalvagingTasks, startSalvaging])

  // Check for completed tasks
  useEffect(() => {
    activeSalvagingTasks.forEach((task) => {
      const elapsed = currentTime - task.startTime
      if (elapsed >= task.duration && !task.completed) {
        const resource = SALVAGING_RESOURCES.find((r) => r.id === task.resourceId)
        if (resource) {
          // Get veterancy bonuses
          const resourceVeterancy = resourceVeterancies.find((rv) => rv.resourceId === task.resourceId)
          const skillVeterancy = skillVeterancies.find((sv) => sv.skillId === 'salvaging')
          
          const veterancyLevel = resourceVeterancy?.level || 0
          const skillVeterancyLevel = skillVeterancy?.level || 0
          
          // Calculate extra resources from veterancy
          const extraResources = calculateExtraResources(veterancyLevel)
          const totalResources = 1 + extraResources
          
          // Give rewards (base + veterancy bonuses)
          addResource(task.resourceId, totalResources)
          
          // Award XP
          const baseXP = resource.xpReward
          addXP('salvaging', baseXP)
          
          // Award veterancy XP
          // Resource veterancy: 1:1 ratio with skill XP
          addResourceVeterancyXP(task.resourceId, baseXP)
          // Skill veterancy: 0.5:1 ratio with skill XP
          addSkillVeterancyXP('salvaging', Math.floor(baseXP * 0.5))
          
          // Show notification (include extra resources if any)
          if (extraResources > 0) {
            addNotification(`${resource.name} +${totalResources} (${extraResources} bonus)`)
          } else {
            addNotification(`${resource.name} +1`)
          }

          // Get current gather count
          const gatherCount = resourceGatherCounts.find((g) => g.resourceId === task.resourceId)
          const currentCount = gatherCount?.count || 0
          const shouldAutoResume = gatherCount?.autoResume === true

          // Calculate max gathers with veterancy bonus
          const gatherLimitBonus = getGatherLimitIncrease(veterancyLevel)
          const maxGathers = BASE_MAX_GATHERS_PER_RESOURCE + gatherLimitBonus

          // Increment gather count
          const newCount = currentCount + 1

          // Mark as completed first
          completeSalvagingTask(task.resourceId)

          // Check if we've reached max gathers
          if (newCount >= maxGathers) {
            // Trigger respawn and reset count
            if (resource.respawnTime > 0) {
              setResourceRespawn(task.resourceId, currentTime + resource.respawnTime * 1000)
            }
            resetGatherCount(task.resourceId)
            // Keep auto-resume flag if it was set
            if (shouldAutoResume) {
              setAutoResume(task.resourceId, true)
            }
          } else {
            // Increment count - always pass true to preserve autoResume if it exists
            incrementGatherCount(task.resourceId, true)
            // Auto-resume immediately if enabled
            if (shouldAutoResume) {
              // Apply speed bonus from skill veterancy (reduces duration)
              const speedBonus = getSpeedBonus(skillVeterancyLevel)
              const baseDuration = resource.baseTime * 1000
              const duration = Math.floor(baseDuration * (1 - speedBonus / 100))
              startSalvaging(task.resourceId, duration)
            }
          }
        }
      }
    })
  }, [
    currentTime,
    activeSalvagingTasks,
    addResource,
    addXP,
    setResourceRespawn,
    resourceGatherCounts,
    incrementGatherCount,
    resetGatherCount,
    setAutoResume,
    addNotification,
    completeSalvagingTask,
    startSalvaging,
    addResourceVeterancyXP,
    addSkillVeterancyXP,
    resourceVeterancies,
    skillVeterancies,
  ])

  // This component doesn't render anything - it just runs in the background
  return null
}
