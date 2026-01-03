export interface FarmingPlot {
  id: string
  purchased: boolean
  plantedSeedId: string | null
  plantedAt: number | null // Timestamp when seed was planted
  readyAt: number | null // Timestamp when crop will be ready
}

export interface ActiveCrop {
  plotId: string
  seedId: string
  plantedAt: number
  readyAt: number
}

