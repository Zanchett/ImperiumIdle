export interface ActiveSalvagingTask {
  resourceId: string
  startTime: number // Timestamp when task started
  duration: number // Total duration in milliseconds
  completed: boolean
}

export interface ResourceRespawn {
  resourceId: string
  respawnTime: number // Timestamp when resource becomes available again
}

export interface ResourceGatherCount {
  resourceId: string
  count: number // How many times gathered since last respawn
  autoResume: boolean // Should auto-resume when respawn completes
}

export interface ActiveEngineeringTask {
  recipeId: string
  startTime: number // Timestamp when task started
  duration: number // Total duration in milliseconds
  completed: boolean
  autoResume: boolean // Should auto-resume when completed
}

export interface ActiveMedicaeResearchTask {
  topicId: string
  startTime: number // Timestamp when task started
  duration: number // Total duration in milliseconds
  completed: boolean
  autoResume: boolean // Should auto-resume when completed
}
