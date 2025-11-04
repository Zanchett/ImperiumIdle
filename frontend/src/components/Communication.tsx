import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Planet, PlanetType, PLANET_TYPES } from '../types/planets'
import { generateInitialPlanets } from '../data/planets'
import './Communication.css'

interface CommunicationProps {
  skillId: string
}

export default function Communication({ skillId }: CommunicationProps) {
  const {
    planets,
    activeContactTasks,
    gold,
    skillCategories,
    startContact,
    completeContactTask,
    discoverPlanet,
    addXP,
    addGold,
    addNotification,
  } = useGameStore()
  
  // Get Communication skill level
  const communicationSkill = skillCategories
    .flatMap(cat => cat.skills)
    .find(skill => skill.id === skillId)
  const skillLevel = communicationSkill?.level || 1

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [selectedPlanetType, setSelectedPlanetType] = useState<PlanetType | null>(null)
  const [availablePlanets, setAvailablePlanets] = useState<Planet[]>([])

  // Rotation interval: 2 minutes (120000ms) - constant for both rotation and timer
  const ROTATION_INTERVAL = 120000

  // Update time for progress bars
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Filter and rotate available planets based on skill level
  useEffect(() => {
    // Calculate how many planets should be available based on level
    // Level 1-10: 1-2 planets, Level 11-20: 2-3, Level 21-30: 3-4, etc.
    const basePlanets = Math.min(Math.floor(skillLevel / 10) + 1, 5)
    const maxPlanets = Math.min(basePlanets + 1, 6)
    const numPlanets = Math.max(1, Math.min(maxPlanets, Math.floor(skillLevel / 5) + 1))
    
    // Calculate rotation index based on current time
    const rotationIndex = Math.floor((currentTime / ROTATION_INTERVAL) % planets.length)
    
    // Get available planets (rotate through all planets)
    const shuffled = [...planets].sort((a, b) => a.id.localeCompare(b.id))
    const rotated = [
      ...shuffled.slice(rotationIndex),
      ...shuffled.slice(0, rotationIndex)
    ]
    
    // Take only the number of planets allowed for this level
    setAvailablePlanets(rotated.slice(0, numPlanets))
  }, [currentTime, planets, skillLevel])

  // Complete contact tasks
  useEffect(() => {
    activeContactTasks.forEach((task) => {
      if (!task.completed && currentTime >= task.startTime + task.duration) {
        completeContactTask(task.planetId)
        discoverPlanet(task.planetId)
        const planet = planets.find((p) => p.id === task.planetId)
        if (planet) {
          addXP(skillId, 100) // XP reward for contacting
          addNotification(`Successfully contacted ${planet.name}!`)
        }
      }
    })
  }, [currentTime, activeContactTasks, completeContactTask, discoverPlanet, planets, skillId, addXP, addNotification])

  const handleStartContact = (planet: Planet) => {
    if (gold < planet.contactCostGold) {
      addNotification(`Not enough gold! Need ${planet.contactCostGold} gold.`)
      return
    }

    addGold(-planet.contactCostGold)
    startContact(planet.id, planet.contactDuration)
    addNotification(`Initiating contact with ${planet.name}...`)
  }

  const getPlanetsByType = (type: PlanetType) => {
    return planets.filter((p) => p.type === type)
  }

  const getProgress = (task: typeof activeContactTasks[0]) => {
    const elapsed = currentTime - task.startTime
    return Math.min(100, (elapsed / task.duration) * 100)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const allPlanetTypes: PlanetType[] = [
    'agri-world',
    'mining-world',
    'grave-world',
    'forge-world',
    'research-world',
    'shrine-world',
    'hive-world',
    'death-world',
    'void-station',
  ]

  // Filter available planets by type if selected
  const displayedPlanets = selectedPlanetType
    ? availablePlanets.filter((p) => p.type === selectedPlanetType)
    : availablePlanets

  // Calculate rotation timer
  const nextRotationTime = Math.ceil(currentTime / ROTATION_INTERVAL) * ROTATION_INTERVAL
  const timeUntilRotation = Math.max(0, nextRotationTime - currentTime)

  return (
    <div className="communication-container">
      <div className="communication-header">
        <h1 className="communication-title">📡 Communication Array</h1>
        <p className="communication-subtitle">Establish contact with distant worlds across the galaxy</p>
        <div className="rotation-timer">
          <span className="rotation-timer-label">Next Rotation:</span>
          <span className="rotation-timer-value">{formatTime(timeUntilRotation)}</span>
        </div>
      </div>

      {/* Planet Type Filter */}
      <div className="planet-type-filter">
        <button
          className={`filter-button ${selectedPlanetType === null ? 'active' : ''}`}
          onClick={() => setSelectedPlanetType(null)}
        >
          All Planets
        </button>
        {allPlanetTypes.map((type) => {
          const typeInfo = PLANET_TYPES[type]
          // Count only available planets (filtered by level) for this type
          const count = availablePlanets.filter((p) => p.type === type).length
          return (
            <button
              key={type}
              className={`filter-button ${selectedPlanetType === type ? 'active' : ''}`}
              onClick={() => setSelectedPlanetType(type)}
            >
              {typeInfo.icon} {typeInfo.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Planets List */}
      <div className="planets-grid">
        {displayedPlanets.map((planet) => {
          const typeInfo = PLANET_TYPES[planet.type]
          const activeTask = activeContactTasks.find((t) => t.planetId === planet.id)
          const canContact = !planet.discovered && !activeTask && gold >= planet.contactCostGold
          const isContacting = !!activeTask && !activeTask.completed

          return (
            <div key={planet.id} className={`planet-card ${planet.discovered ? 'discovered' : ''}`}>
              <div className="planet-card-header">
                <div className="planet-icon">{typeInfo.icon}</div>
                <div className="planet-info">
                  <h3 className="planet-name">{planet.name}</h3>
                  <p className="planet-type">{typeInfo.name}</p>
                </div>
                {planet.discovered && (
                  <div className="discovered-badge">✓ Contacted</div>
                )}
              </div>

              <div className="planet-card-body">
                <p className="planet-description">{typeInfo.description}</p>
                <div className="planet-details">
                  <div className="planet-detail">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{planet.size.charAt(0).toUpperCase() + planet.size.slice(1)}</span>
                  </div>
                  <div className="planet-detail">
                    <span className="detail-label">Contact Cost:</span>
                    <span className="detail-value">{planet.contactCostGold.toLocaleString()} gold</span>
                  </div>
                  <div className="planet-detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{formatTime(planet.contactDuration)}</span>
                  </div>
                </div>

                {isContacting && activeTask && (
                  <div className="contact-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgress(activeTask)}%` }}
                      />
                    </div>
                    <p className="progress-text">
                      Contacting... {formatTime(activeTask.duration - (currentTime - activeTask.startTime))} remaining
                    </p>
                  </div>
                )}

                {!planet.discovered && !isContacting && (
                  <button
                    className={`contact-button ${canContact ? '' : 'disabled'}`}
                    onClick={() => handleStartContact(planet)}
                    disabled={!canContact}
                  >
                    {canContact ? 'Establish Contact' : `Need ${planet.contactCostGold} gold`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {displayedPlanets.length === 0 && (
        <div className="no-planets">
          <p>No planets available. Check back later!</p>
        </div>
      )}
    </div>
  )
}

