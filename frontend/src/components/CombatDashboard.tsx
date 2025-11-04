import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Enemy } from '../types/enemies'
import { ENGINEERING_RECIPES, type EngineeringRecipe } from '../types/engineeringResources'
import DeathPopup from './DeathPopup'
import { getCumulativeExperience } from '../utils/experience'
import { calculateMeleeDamage, rollDamage, type AttackType } from '../utils/combat'
import './CombatDashboard.css'

interface CombatDashboardProps {
  skillId: string
  selectedEnemy: Enemy | null
  combatActive: boolean
  onCombatStop: () => void
}

interface CombatMessage {
  id: string
  message: string
  type: 'player-damage' | 'enemy-damage' | 'player-heal' | 'enemy-heal' | 'info'
  timestamp: number
}


// Equipment type mapping for grid positions
const EQUIPMENT_TYPE_MAP: Record<string, string[]> = {
  '0-0': ['necklace', 'amulet', 'pendant'], // Row 1, Col 1
  '0-1': ['helmet', 'helm'], // Row 1, Col 2
  '0-2': ['cape', 'cloak'], // Row 1, Col 3
  '1-0': ['sword', 'dagger', 'blade', 'weapon', 'scimitar', 'battleaxe'], // Row 2, Col 1
  '1-1': ['armor', 'platebody', 'chest'], // Row 2, Col 2
  '1-2': ['shield'], // Row 2, Col 3
  '2-0': ['gloves', 'gauntlets'], // Row 3, Col 1
  '2-1': ['pants', 'legs', 'platelegs'], // Row 3, Col 2
  '2-2': ['ring'], // Row 3, Col 3
  '3-0': ['book', 'tome', 'grimoire', 'chant', 'prayer'], // Row 4, Col 1
  '3-1': ['boots', 'feet', 'shoes'], // Row 4, Col 2
  '3-2': ['bible', 'augment', 'enhancement', 'relic'], // Row 4, Col 3
  // Usable items (consumables) are in a separate panel
  'medical': ['medical', 'medkit', 'heal', 'potion', 'medicine'], // Medical items slot
  'food': ['food', 'ration', 'meal', 'provision'], // Food items slot
}

export default function CombatDashboard({ skillId, selectedEnemy, combatActive, onCombatStop }: CombatDashboardProps) {
  const { addGold, addXP, resources, combatSubStats, addCombatSubStatXP, removeXP, removeCombatSubStatXP, skillCategories } = useGameStore()
  const [combatLog, setCombatLog] = useState<CombatMessage[]>([])
  const [playerHealth, setPlayerHealth] = useState(100)
  const [playerMaxHealth] = useState(100)
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(selectedEnemy)
  const [enemyHealth, setEnemyHealth] = useState(selectedEnemy?.maxHealth || 100)
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<string | null>(null)
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({}) // slotKey -> itemId
  const [selectedAttackType, setSelectedAttackType] = useState<AttackType>('bash') // Default to bash
  const [lastAttackTime, setLastAttackTime] = useState<number>(Date.now())
  const [attackSpeedProgress, setAttackSpeedProgress] = useState<number>(0)
  const [lastEnemyAttackTime, setLastEnemyAttackTime] = useState<number>(Date.now())
  const [enemyAttackSpeedProgress, setEnemyAttackSpeedProgress] = useState<number>(0)
  const [showDeathPopup, setShowDeathPopup] = useState(false)
  const [deathXPLoss, setDeathXPLoss] = useState({ mainSkill: 0, subSkill: 0, subSkillName: '' })
  const [searchingForEnemy, setSearchingForEnemy] = useState(false)
  const [enemyHitAnimation, setEnemyHitAnimation] = useState<string | null>(null)
  const combatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)
  const attackerTurnRef = useRef<'player' | 'enemy'>('player')
  const lastPlayerAttackTimeRef = useRef<number>(0)
  const lastEnemyAttackTimeRef = useRef<number>(0)
  const hasDiedRef = useRef<boolean>(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSearchingRef = useRef<boolean>(false) // Use ref to prevent race conditions
  const enemyHealthRef = useRef<number>(selectedEnemy?.maxHealth || 100) // Track enemy health synchronously
  const combatProcessingRef = useRef<boolean>(false) // Lock to prevent concurrent combat processing

  // Calculate player stats from equipped items + sub-skill bonuses
  const calculatePlayerStats = () => {
    let baseDamage = 5 // Base damage without equipment
    let totalArmor = 0
    let totalAccuracy = 0 // Accuracy (a in hit chance formula)
    let totalCritChance = 0
    let equippedWeapon: EngineeringRecipe | null = null
    
    // Track armor by style for affinity calculation
    let armorMelee = 0
    let armorRanged = 0
    let armorMagic = 0
    let armorHybrid = 0
    
    // Base accuracy if no equipment
    if (totalAccuracy === 0) {
      totalAccuracy = 50 // Base accuracy
    }
    
    // Ensure combatSubStats exists
    if (!combatSubStats) {
      return {
        attack: baseDamage,
        defense: totalArmor,
        health: playerMaxHealth,
        accuracy: totalAccuracy,
        critChance: 0,
        critDamage: 150,
        attackSpeed: 4000,
        equippedWeapon: null,
        affinity: {
          melee: 55,
          ranged: 55,
          magic: 55,
        },
      }
    }
    
    // Sum stats from all equipped items
    Object.entries(equippedItems).forEach(([, itemId]) => {
      const item = ENGINEERING_RECIPES.find(r => r.id === itemId)
      if (item?.equipmentStats) {
        if (item.equipmentStats.damage) {
          baseDamage += item.equipmentStats.damage
          equippedWeapon = item
        }
        if (item.equipmentStats.armor) {
          const armorValue = item.equipmentStats.armor
          totalArmor += armorValue
          
          // Track armor by style for affinity calculation
          const armorStyle = item.equipmentStats.armorStyle || 'melee' // Default to melee
          if (armorStyle === 'melee') {
            armorMelee += armorValue
          } else if (armorStyle === 'ranged') {
            armorRanged += armorValue
          } else if (armorStyle === 'magic') {
            armorMagic += armorValue
          } else if (armorStyle === 'hybrid') {
            armorHybrid += armorValue
          }
        }
        if (item.equipmentStats.accuracy) {
          totalAccuracy += item.equipmentStats.accuracy
        }
        if (item.equipmentStats.critChance) {
          totalCritChance += item.equipmentStats.critChance
        }
      }
    })
    
    // Apply sub-skill bonuses
    // Attack: increases accuracy and crit chance
    const attackAccuracyBonus = (combatSubStats.attack?.level || 0) * 5 // +5 accuracy per level
    const attackCritBonus = (combatSubStats.attack?.level || 0) * 0.5 // +0.5% crit chance per level
    totalAccuracy += attackAccuracyBonus
    totalCritChance += attackCritBonus
    
    // Calculate damage using new formula system
    // Calculate max hit based on currently selected attack type for accurate stat display
    const strengthLevel = combatSubStats.strength?.level || 0
    // Get weapon stats safely
    let weaponDamage = 0
    let weaponPreferredType: AttackType | undefined = undefined
    if (equippedWeapon && equippedWeapon.equipmentStats) {
      weaponDamage = equippedWeapon.equipmentStats.damage ?? 0
      weaponPreferredType = equippedWeapon.equipmentStats.attackType
    }
    const damageCalculation = calculateMeleeDamage(
      strengthLevel,
      weaponDamage,
      selectedAttackType, // Use selected attack type for accurate stat display
      weaponPreferredType,
      0, // medicalBonus - placeholder for future medical items
      1.0, // chantBonus - placeholder for future chants
      1.0 // specialBonus - no special attacks for now
    )
    
    // Strength crit damage bonus (still applies to crit multiplier)
    const strengthCritDamageBonus = strengthLevel * 5 // +5% crit damage per level
    const baseCritDamage = 150 + strengthCritDamageBonus
    
    // Store max hit for display (this is the actual max damage with current setup)
    const finalDamage = damageCalculation.maxHit
    
    // Defence: increases damage mitigation (armor)
    const defenceArmorBonus = (combatSubStats.defence?.level || 0) * 1 // +1 armor per level
    const finalArmor = totalArmor + defenceArmorBonus
    
    // Calculate player affinity from equipped armor
    // Formula: Aff_Style = (45*A_Weak + 65*A_Strong + 55*A_Same + 55*A_Hybrid) / A_Worn
    // For melee: Aff_Melee = (45*A_Magic + 65*A_Ranged + 55*A_Melee + 55*A_Hybrid) / A_Worn
    // For ranged: Aff_Ranged = (45*A_Melee + 65*A_Magic + 55*A_Ranged + 55*A_Hybrid) / A_Worn
    // For magic: Aff_Magic = (45*A_Ranged + 65*A_Melee + 55*A_Magic + 55*A_Hybrid) / A_Worn
    const armorWorn = armorMelee + armorRanged + armorMagic + armorHybrid
    let playerAffinityMelee = 55 // Default neutral
    let playerAffinityRanged = 55
    let playerAffinityMagic = 55
    
    if (armorWorn > 0) {
      // Calculate weighted average affinity
      playerAffinityMelee = (45 * armorMagic + 65 * armorRanged + 55 * armorMelee + 55 * armorHybrid) / armorWorn
      playerAffinityRanged = (45 * armorMelee + 65 * armorMagic + 55 * armorRanged + 55 * armorHybrid) / armorWorn
      playerAffinityMagic = (45 * armorRanged + 65 * armorMelee + 55 * armorMagic + 55 * armorHybrid) / armorWorn
    }
    
    // Agility: increases attack speed (reduces delay between attacks)
    // Each agility level reduces attack speed by 0.5% (scaled down from 2%)
    // Maximum cap: 3.3 seconds (3300ms)
    const baseAttackSpeed = 4000 // Base attack speed in milliseconds (4 seconds)
    const agilityReduction = (combatSubStats.agility?.level || 0) * 0.005 // 0.5% per level (scaled down)
    const finalAttackSpeed = Math.max(3300, baseAttackSpeed * (1 - agilityReduction)) // Cap at 3.3 seconds
    
    return {
      attack: finalDamage,
      defense: finalArmor,
      health: playerMaxHealth,
      accuracy: totalAccuracy,
      critChance: Math.min(50, totalCritChance), // Cap at 50%
      critDamage: baseCritDamage,
      attackSpeed: finalAttackSpeed,
      equippedWeapon: equippedWeapon as EngineeringRecipe | null,
      // Player affinity (affects enemy hit chance against player)
      affinity: {
        melee: Math.trunc(playerAffinityMelee),
        ranged: Math.trunc(playerAffinityRanged),
        magic: Math.trunc(playerAffinityMagic),
      },
    }
  }
  
  // Calculate hit chance against a specific enemy using the formula: H = Aff × (a / d) + m
  const calculateHitChance = (attackType: AttackType, enemy: Enemy, playerAccuracy: number, additiveModifier: number = 0): number => {
    // Get affinity for the attack type (with safe defaults)
    const affinity = enemy.affinity?.[attackType] || 55 // Default to neutral affinity
    
    // Get enemy armor rating (with safe default)
    const enemyArmor = enemy.armor || 50 // Default armor
    
    // Calculate: H = Aff × (a / d) + m
    // Affinity is a percentage (0-100), so we divide by 100 to get the multiplier
    const affinityMultiplier = affinity / 100
    const accuracyRatio = playerAccuracy / enemyArmor
    const hitChance = (affinityMultiplier * accuracyRatio * 100) + additiveModifier
    
    // Cap at 100%
    return Math.min(100, Math.max(0, hitChance))
  }
  
  const playerStats = calculatePlayerStats()

  // Get equipment items for a specific slot
  const getEquipmentForSlot = (slotKey: string) => {
    const keywords = EQUIPMENT_TYPE_MAP[slotKey] || []
    if (keywords.length === 0) return []

    return ENGINEERING_RECIPES.filter((recipe) => {
      const nameLower = recipe.name.toLowerCase()
      const idLower = recipe.id.toLowerCase()
      return keywords.some((keyword) => nameLower.includes(keyword) || idLower.includes(keyword))
    })
      .filter((recipe) => (resources[recipe.id] || 0) > 0)
      .map((recipe) => ({
        ...recipe,
        quantity: resources[recipe.id] || 0,
      }))
  }

  const handleCellClick = (rowIndex: number | string, colIndex?: number) => {
    const slotKey = typeof rowIndex === 'string' ? rowIndex : `${rowIndex}-${colIndex || 0}`
    const equipment = getEquipmentForSlot(slotKey)
    if (equipment.length > 0 || EQUIPMENT_TYPE_MAP[slotKey]) {
      setSelectedEquipmentSlot(slotKey)
    }
  }

  const handleEquipItem = (itemId: string) => {
    if (selectedEquipmentSlot) {
      setEquippedItems((prev) => ({
        ...prev,
        [selectedEquipmentSlot]: itemId,
      }))
      setSelectedEquipmentSlot(null)
    }
  }

  const handleClosePopup = () => {
    setSelectedEquipmentSlot(null)
  }

  const handleResumeFromDeath = () => {
    // Reset death flag
    hasDiedRef.current = false
    // Reset health to 100%
    setPlayerHealth(100)
    // Reset enemy health
    if (currentEnemy) {
      enemyHealthRef.current = currentEnemy.maxHealth
      setEnemyHealth(currentEnemy.maxHealth)
    }
    // Reset attack timers
    lastPlayerAttackTimeRef.current = 0
    lastEnemyAttackTimeRef.current = 0
    attackerTurnRef.current = 'player'
    // Close popup
    setShowDeathPopup(false)
    // Clear combat log
    setCombatLog([])
  }

  // Scroll log to bottom when new messages are added
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [combatLog])

  // Update current enemy when selected enemy changes
  useEffect(() => {
    if (selectedEnemy) {
      setCurrentEnemy(selectedEnemy)
      enemyHealthRef.current = selectedEnemy.maxHealth
      setEnemyHealth(selectedEnemy.maxHealth)
      setCombatLog([])
      setPlayerHealth(100) // Always reset to 100
      hasDiedRef.current = false // Reset death flag when enemy changes
      setShowDeathPopup(false) // Close death popup if open
      const now = Date.now()
      setLastAttackTime(now)
      setLastEnemyAttackTime(now)
      setAttackSpeedProgress(0)
      setEnemyAttackSpeedProgress(0)
      // Reset refs to 0 so they'll be initialized when combat starts
      lastPlayerAttackTimeRef.current = 0
      lastEnemyAttackTimeRef.current = 0
      attackerTurnRef.current = 'player'
    }
  }, [selectedEnemy, playerMaxHealth])

  // Attack speed progress bar update for player
  useEffect(() => {
    if (!combatActive || !currentEnemy || searchingForEnemy) {
      setAttackSpeedProgress(0)
      return
    }

    const progressInterval = setInterval(() => {
      if (lastPlayerAttackTimeRef.current === 0 || searchingForEnemy) {
        setAttackSpeedProgress(0)
        return
      }
      const currentStats = calculatePlayerStats()
      const attackSpeed = currentStats.attackSpeed ?? 4000
      const elapsed = Date.now() - lastPlayerAttackTimeRef.current
      const progress = Math.min(Math.max(0, (elapsed / attackSpeed) * 100), 100)
      setAttackSpeedProgress(progress)
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(progressInterval)
  }, [combatActive, currentEnemy, equippedItems, combatSubStats, searchingForEnemy])

  // Attack speed progress bar update for enemy
  useEffect(() => {
    if (!combatActive || !currentEnemy || searchingForEnemy) {
      setEnemyAttackSpeedProgress(0)
      return
    }

    const progressInterval = setInterval(() => {
      if (lastEnemyAttackTimeRef.current === 0 || searchingForEnemy) {
        setEnemyAttackSpeedProgress(0)
        return
      }
      const enemyAttackSpeed = currentEnemy.attackSpeed || 4000
      const elapsed = Date.now() - lastEnemyAttackTimeRef.current
      const progress = Math.min(Math.max(0, (elapsed / enemyAttackSpeed) * 100), 100)
      setEnemyAttackSpeedProgress(progress)
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(progressInterval)
  }, [combatActive, currentEnemy, searchingForEnemy])

  // Combat loop
  useEffect(() => {
    if (!combatActive || !currentEnemy) {
      if (combatIntervalRef.current) {
        clearInterval(combatIntervalRef.current)
        combatIntervalRef.current = null
      }
      // Clear search timer if combat stops
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }
      isSearchingRef.current = false
      combatProcessingRef.current = false // Unlock when combat stops
      setSearchingForEnemy(false)
      // When combat stops, reset enemy HP to 100% but keep player HP
      if (currentEnemy && !combatActive) {
        enemyHealthRef.current = currentEnemy.maxHealth
        setEnemyHealth(currentEnemy.maxHealth)
      }
      return () => {
        // Cleanup on unmount
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current)
          searchTimerRef.current = null
        }
      }
    }

    // Initialize attack times when combat starts - only if not already set
    if (lastPlayerAttackTimeRef.current === 0) {
      const now = Date.now()
      lastPlayerAttackTimeRef.current = now
      lastEnemyAttackTimeRef.current = now
      attackerTurnRef.current = 'player'
      hasDiedRef.current = false // Reset death flag when combat starts
      // Ensure health is at 100 when starting combat
      setPlayerHealth(100)
      if (currentEnemy) {
        enemyHealthRef.current = currentEnemy.maxHealth
        setEnemyHealth(currentEnemy.maxHealth)
      }
      // Reset progress bars to 0 when starting
      setAttackSpeedProgress(0)
      setEnemyAttackSpeedProgress(0)
    }

    const combatTick = () => {
      // Early exit if searching or already processing (use ref for immediate check)
      if (isSearchingRef.current || combatProcessingRef.current) {
        return
      }
      
      // Determine whose turn it is BEFORE locking to prevent double attacks
      const currentTurn = attackerTurnRef.current
      
      // Lock combat processing to prevent concurrent damage calculations
      combatProcessingRef.current = true
      
      // Update attack timer immediately to prevent double attacks from rapid timer ticks
      // This must happen BEFORE the async setTimeout to ensure the next tick sees the updated time
      if (currentTurn === 'player') {
        lastPlayerAttackTimeRef.current = Date.now()
        attackerTurnRef.current = 'enemy' // Switch turn immediately
      } else if (currentTurn === 'enemy') {
        lastEnemyAttackTimeRef.current = Date.now()
        attackerTurnRef.current = 'player' // Switch turn immediately
      }
      
      // Use setTimeout to ensure state updates happen after render phase
      // This prevents React warnings about updating state during render
      setTimeout(() => {
        // Collect all store updates to execute after state updates complete
        const storeUpdates: Array<() => void> = []
        
        try {
        // Get current state values for this tick
        // NOTE: We use enemyHealthRef as the source of truth, not currentEnemyHealth from state
        // This prevents race conditions where state is stale
        setPlayerHealth((currentPlayerHealth) => {
          setEnemyHealth((currentEnemyHealth) => {
          // Use ref as source of truth - don't sync with potentially stale state
          // The ref is updated immediately when health changes, state is async
          const actualEnemyHealth = enemyHealthRef.current
          // Check if combat should stop (player or enemy dead)
          // Check player death first (before any other checks)
          if (currentPlayerHealth <= 0) {
            // Check if death has already been handled
            if (hasDiedRef.current) {
              combatProcessingRef.current = false // Unlock
              return actualEnemyHealth // Already handled, don't process again
            }
            
            // Mark death as handled
            hasDiedRef.current = true
            
            // Calculate XP loss (5% of current XP for main skill and sub-skill)
            const mainSkill = skillCategories
              .flatMap(cat => cat.skills)
              .find(skill => skill.id === skillId)
            
            let mainSkillXPLost = 0
            if (mainSkill) {
              const currentCumulativeXP = getCumulativeExperience(mainSkill.level) + mainSkill.experience
              mainSkillXPLost = Math.floor(currentCumulativeXP * 0.05)
              if (mainSkillXPLost > 0) {
                // Queue store update instead of calling directly
                storeUpdates.push(() => removeXP(skillId, mainSkillXPLost))
              }
            }
            
            // Determine which sub-skill to penalize based on selected attack type
            let subSkillType: 'strength' | 'attack' | 'defence' | 'agility' | null = null
            let subSkillName = ''
            if (selectedAttackType === 'bash') {
              subSkillType = 'strength'
              subSkillName = 'Strength'
            } else if (selectedAttackType === 'cut') {
              subSkillType = 'attack'
              subSkillName = 'Attack'
            } else if (selectedAttackType === 'block') {
              subSkillType = 'defence'
              subSkillName = 'Defence'
            } else if (selectedAttackType === 'stab') {
              subSkillType = 'agility'
              subSkillName = 'Agility'
            }
            
            let subSkillXPLost = 0
            if (subSkillType) {
              const currentSubStat = combatSubStats[subSkillType]
              const currentCumulativeXP = getCumulativeExperience(currentSubStat.level) + currentSubStat.experience
              subSkillXPLost = Math.floor(currentCumulativeXP * 0.05)
              if (subSkillXPLost > 0) {
                // Queue store update instead of calling directly
                storeUpdates.push(() => removeCombatSubStatXP(subSkillType!, subSkillXPLost))
              }
            }
            
            // Store XP loss for popup
            setDeathXPLoss({
              mainSkill: mainSkillXPLost,
              subSkill: subSkillXPLost,
              subSkillName: subSkillName
            })
            
            // Reset health to 100 for player and enemy
            setPlayerHealth(100)
            enemyHealthRef.current = currentEnemy.maxHealth
            setEnemyHealth(currentEnemy.maxHealth)
            
            // Stop combat and show popup
            onCombatStop()
            setShowDeathPopup(true)
            
            combatProcessingRef.current = false // Unlock
            return currentEnemy.maxHealth
          }

          // Check enemy death (after player death check)
          // Note: Enemy death is now handled immediately when damage is dealt (see player attack section)
          // During search period, don't process combat (enemy health is 0)
          // Use ref to prevent race conditions with state updates
          if (isSearchingRef.current || searchingForEnemy || (actualEnemyHealth <= 0 && actualEnemyHealth !== currentEnemy.maxHealth)) {
            // If searching, don't process combat yet
            if (isSearchingRef.current || searchingForEnemy) {
              combatProcessingRef.current = false // Unlock
              return actualEnemyHealth
            }
            // Enemy defeated (fallback check - should not happen normally)
            addMessage(`You defeated ${currentEnemy.name}!`, 'info')
            // Queue store updates instead of calling directly
            storeUpdates.push(() => {
              addXP(skillId, currentEnemy.xpReward)
              addGold(currentEnemy.goldReward)
            })
            addMessage(`Gained ${currentEnemy.xpReward} XP and ${currentEnemy.goldReward} gold`, 'info')
            
            // Start searching for new enemy
            isSearchingRef.current = true
            setSearchingForEnemy(true)
            if (searchTimerRef.current) {
              clearTimeout(searchTimerRef.current)
            }
            searchTimerRef.current = setTimeout(() => {
              isSearchingRef.current = false
              setSearchingForEnemy(false)
              enemyHealthRef.current = currentEnemy.maxHealth
              setEnemyHealth(currentEnemy.maxHealth)
              combatProcessingRef.current = false // Unlock when search completes
              lastPlayerAttackTimeRef.current = Date.now()
              lastEnemyAttackTimeRef.current = Date.now()
              attackerTurnRef.current = 'player'
              // Reset progress bars for new enemy
              setAttackSpeedProgress(0)
              setEnemyAttackSpeedProgress(0)
            }, 3000)
            
            // Keep locked for now - will be unlocked when search completes
            // But for fallback case, unlock immediately since we're not in normal flow
            combatProcessingRef.current = false
            return 0
          }

          // Combat continues
          // Use the turn we captured at the start of combatTick to prevent race conditions
          if (currentTurn === 'player') {
            // Recalculate stats for this tick
            const currentStats = calculatePlayerStats()
            
            // Player attacks - determine attack type
            let attackMessage = ''
            let statToTrain: 'strength' | 'attack' | 'defence' | 'agility' | null = null
            
            if (selectedAttackType === 'bash') {
              // Bash trains Strength
              statToTrain = 'strength'
              attackMessage = 'You bash'
            } else if (selectedAttackType === 'cut') {
              // Cut trains Attack
              statToTrain = 'attack'
              attackMessage = 'You cut'
            } else if (selectedAttackType === 'stab') {
              // Stab trains Agility
              statToTrain = 'agility'
              attackMessage = 'You stab'
            } else if (selectedAttackType === 'block') {
              // Block trains Defence (but doesn't deal damage, reduces incoming damage)
              statToTrain = 'defence'
              attackMessage = 'You block'
              // Blocking reduces next enemy attack damage instead of dealing damage
              // For block, we'll award XP based on enemy attack damage blocked (calculated later)
              // Turn already switched at start of combatTick, just unlock
              setLastAttackTime(Date.now())
              combatProcessingRef.current = false // Unlock
              return actualEnemyHealth // No damage dealt, XP will be awarded when blocking enemy attack
            }
            
            // Calculate damage (bash, cut, and stab deal damage)
            // Calculate hit chance using the formula: H = Aff × (a / d) + m
            const hitChance = calculateHitChance(selectedAttackType, currentEnemy, currentStats.accuracy, 0)
            
            // If hit chance is less than 1%, all attacks miss
            if (hitChance < 1) {
              addMessage(`You miss ${currentEnemy.name}!`, 'player-damage')
              // Turn already switched at start of combatTick, just unlock
              setLastAttackTime(Date.now())
              combatProcessingRef.current = false // Unlock
              return actualEnemyHealth
            }
            
            // Calculate damage using new formula system
            const strengthLevel = combatSubStats?.strength?.level || 0
            const weapon = currentStats.equippedWeapon
            const weaponDamage = weapon?.equipmentStats?.damage ?? 0
            const weaponPreferredType = weapon?.equipmentStats?.attackType
            
            // Get medical and chant bonuses (placeholders for now)
            // TODO: Implement medical items and chants system
            const medicalBonus = 0 // Placeholder: will be from equipped medical items
            const chantBonus = 1.0 // Placeholder: will be from equipped chants
            
            // Calculate base damage, max hit, and min hit using new formulas
            const damageCalculation = calculateMeleeDamage(
              strengthLevel,
              weaponDamage,
              selectedAttackType,
              weaponPreferredType,
              medicalBonus,
              chantBonus,
              1.0, // specialBonus - no special attacks for now
              0, // minHitPercentageModifier - from equipment/meds/chants (not implemented yet)
              0  // minHitFlatModifier - from equipment/meds/chants (not implemented yet)
            )
            
            // Roll damage between min and max hit (pre-modifier roll)
            const rolledDamage = rollDamage(damageCalculation.minHit, damageCalculation.maxHit)
            
            // Post-roll modifiers (Melvor structure: apply after damage roll)
            // Check for crit
            const isCrit = Math.random() * 100 < currentStats.critChance
            const critMultiplier = isCrit ? (currentStats.critDamage / 100) : 1.0
            
            // Scale damage by hit chance (1-100% scales damage, <1% = miss)
            // Hit chance acts as damage potential multiplier (post-roll modifier)
            const damagePotential = hitChance / 100
            
            // Apply post-roll modifiers: rolledDamage × critMultiplier × hitChance
            const modifiedDamage = Math.floor(rolledDamage * critMultiplier * damagePotential)
            
            // Enemy damage reduction (post-roll modifier)
            const defenseMultiplier = currentEnemy.takesDamage.find(d => d.from === 'physical')?.multiplier || 1.0
            const finalDamage = Math.floor(modifiedDamage * defenseMultiplier)
            
            // Award XP: 0.4 XP per point of damage dealt to the selected attack style
            if (statToTrain && finalDamage > 0) {
              const xpToAward = Math.floor(finalDamage * 0.4)
              // Queue store update instead of calling directly
              storeUpdates.push(() => addCombatSubStatXP(statToTrain, xpToAward))
            }
            
            // Trigger hit animation based on attack type
            if (finalDamage > 0) {
              const animationType = selectedAttackType === 'bash' ? 'hit-bash'
                : selectedAttackType === 'cut' ? 'hit-slash'
                : selectedAttackType === 'stab' ? 'hit-stab'
                : null
              
              if (animationType) {
                setEnemyHitAnimation(animationType)
                // Remove animation class after animation completes (400ms)
                setTimeout(() => setEnemyHitAnimation(null), 400)
              }
            }
            
            if (isCrit) {
              addMessage(`${attackMessage} ${finalDamage} damage (CRITICAL!) to ${currentEnemy.name}`, 'player-damage')
            } else {
              addMessage(`${attackMessage} ${finalDamage} damage to ${currentEnemy.name}`, 'player-damage')
            }
            
            // Turn already switched at start of combatTick, just update display time
            setLastAttackTime(Date.now())
            
            // Early exit if enemy is already dead or we're searching for a new enemy
            // Use the ref value we already have (actualEnemyHealth) from the beginning of the callback
            if (actualEnemyHealth <= 0 || isSearchingRef.current) {
              // Enemy already dead or searching, skip this attack
              return actualEnemyHealth
            }
            
            // Calculate new enemy health - cap damage at current health to prevent overkill
            // Use the ref value to ensure consistency across rapid state updates
            const newEnemyHealth = Math.max(0, actualEnemyHealth - finalDamage)
            
            // Update ref immediately for synchronous tracking
            enemyHealthRef.current = newEnemyHealth
            
            // Check if enemy dies (health <= 0) - stop immediately, don't allow negative health
            if (newEnemyHealth <= 0) {
              // Enemy defeated - award rewards
              addMessage(`You defeated ${currentEnemy.name}!`, 'info')
              // Queue store updates instead of calling directly
              storeUpdates.push(() => {
                addXP(skillId, currentEnemy.xpReward)
                addGold(currentEnemy.goldReward)
              })
              addMessage(`Gained ${currentEnemy.xpReward} XP and ${currentEnemy.goldReward} gold`, 'info')
              
              // Set ref immediately to prevent race conditions
              isSearchingRef.current = true
              
              // Start searching for new enemy (3 second animation period)
              setSearchingForEnemy(true)
              
              // Reset and stop progress bars during search
              setAttackSpeedProgress(0)
              setEnemyAttackSpeedProgress(0)
              
              // Clear any existing search timer
              if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current)
              }
              
              // After 3 seconds, reset enemy health to full for next spawn
              searchTimerRef.current = setTimeout(() => {
                isSearchingRef.current = false
                setSearchingForEnemy(false)
                enemyHealthRef.current = currentEnemy.maxHealth
                setEnemyHealth(currentEnemy.maxHealth)
                combatProcessingRef.current = false // Unlock when search completes
                // Reset attack timers for new enemy
                lastPlayerAttackTimeRef.current = Date.now()
                lastEnemyAttackTimeRef.current = Date.now()
                attackerTurnRef.current = 'player'
                // Reset progress bars for new enemy
                setAttackSpeedProgress(0)
                setEnemyAttackSpeedProgress(0)
              }, 3000)
              
              // Return 0 to indicate enemy is dead (will be reset after search period)
              // Keep locked - will be unlocked when search completes
              return 0
            }
            
            // If already searching, don't process this attack
            if (isSearchingRef.current) {
              combatProcessingRef.current = false // Unlock
              return actualEnemyHealth
            }
            
            // Unlock before returning
            combatProcessingRef.current = false
            return newEnemyHealth
          } else if (currentTurn === 'enemy') {
            // Enemy attacks
            const currentStats = calculatePlayerStats()
            const attack = currentEnemy.attacks[Math.floor(Math.random() * currentEnemy.attacks.length)]
            
            // Calculate enemy hit chance against player using the formula: H = Aff × (a / d) + m
            // Enemy's accuracy (for now, use a base value based on enemy level)
            const enemyAccuracy = currentEnemy.level * 10 + 50 // Scale with level
            // Player's armor rating (d in formula)
            const playerArmor = currentStats.defense || 50
            // Map enemy attack type to combat style for affinity lookup
            // Physical/chaos/poison/explosive = melee style, energy/psychic/void = magic style
            const enemyAttackStyle = attack.type === 'energy' || attack.type === 'psychic' || attack.type === 'void' 
              ? 'magic' 
              : 'melee' // Physical, chaos, poison, explosive default to melee
            
            // Use player's affinity as the Aff value (how hard it is for enemy to hit player)
            const playerAffinity = currentStats.affinity?.[enemyAttackStyle] || 55
            const affinityMultiplier = playerAffinity / 100
            const accuracyRatio = enemyAccuracy / playerArmor
            const enemyHitChance = (affinityMultiplier * accuracyRatio * 100)
            
            // Cap at 100%
            const finalEnemyHitChance = Math.min(100, Math.max(0, enemyHitChance))
            
            // If hit chance is less than 1%, all attacks miss
            if (finalEnemyHitChance < 1) {
              addMessage(`${currentEnemy.name} misses you!`, 'info')
              // Turn already switched at start of combatTick, just update display time
              setLastEnemyAttackTime(Date.now())
              combatProcessingRef.current = false // Unlock
              return actualEnemyHealth
            }
            
            // Scale enemy damage by hit chance (damage potential)
            const enemyDamagePotential = finalEnemyHitChance / 100
            
            // Calculate damage mitigation from armor and defence skill
            // Defence skill provides % damage reduction
            const defenceMitigation = (combatSubStats?.defence?.level || 0) * 1 // +1% per level, capped at some max
            const armorReduction = Math.min(50, currentStats.defense * 2) // Each armor point = 2% reduction, cap at 50%
            const totalMitigation = Math.min(75, defenceMitigation + armorReduction) // Cap total at 75%
            
            // Scale base damage by hit chance (damage potential)
            const baseDamage = Math.floor(attack.damage * enemyDamagePotential)
            
            let defenseMultiplier = 1.0 - (totalMitigation / 100)
            
            // Block reduces incoming damage significantly (stacking with armor/defence)
            const isBlocking = selectedAttackType === 'block'
            let damageWithoutBlock = 0
            if (isBlocking) {
              // Calculate damage without block first (for XP calculation)
              damageWithoutBlock = Math.floor(baseDamage * Math.max(0.1, 1.0 - (totalMitigation / 100)))
              defenseMultiplier = Math.max(0.25, defenseMultiplier * 0.5) // Block reduces remaining damage by 50%
            }
            
            const damage = Math.floor(baseDamage * Math.max(0.1, defenseMultiplier))
            
            // Award XP for blocking: 0.4 XP per point of damage blocked
            if (isBlocking && damageWithoutBlock > damage) {
              const damageBlocked = damageWithoutBlock - damage
              const xpToAward = Math.floor(damageBlocked * 0.4)
              // Queue store update instead of calling directly
              storeUpdates.push(() => addCombatSubStatXP('defence', xpToAward))
            }
            
            if (isBlocking) {
              addMessage(`${currentEnemy.name} deals ${damage} ${attack.type} damage to you (BLOCKED)`, 'enemy-damage')
            } else {
              addMessage(`${currentEnemy.name} deals ${damage} ${attack.type} damage to you`, 'enemy-damage')
            }
            
            // Turn already switched at start of combatTick, just update display time
            setLastEnemyAttackTime(Date.now())
            
            // Calculate new player health - cap damage at current health to prevent overkill
            const newPlayerHealth = Math.max(0, currentPlayerHealth - damage)
            
            // Check if player dies immediately (health <= 0) - don't wait for state update
            if (newPlayerHealth <= 0 && !hasDiedRef.current) {
              // Mark death as handled immediately
              hasDiedRef.current = true
              
              // Calculate XP loss (5% of current XP for main skill and sub-skill)
              const mainSkill = skillCategories
                .flatMap(cat => cat.skills)
                .find(skill => skill.id === skillId)
              
                let mainSkillXPLost = 0
                if (mainSkill) {
                  const currentCumulativeXP = getCumulativeExperience(mainSkill.level) + mainSkill.experience
                  mainSkillXPLost = Math.floor(currentCumulativeXP * 0.05)
                  if (mainSkillXPLost > 0) {
                    // Queue store update instead of calling directly
                    storeUpdates.push(() => removeXP(skillId, mainSkillXPLost))
                  }
                }
                
                // Determine which sub-skill to penalize based on selected attack type
                let subSkillType: 'strength' | 'attack' | 'defence' | 'agility' | null = null
                let subSkillName = ''
                if (selectedAttackType === 'bash') {
                  subSkillType = 'strength'
                  subSkillName = 'Strength'
                } else if (selectedAttackType === 'cut') {
                  subSkillType = 'attack'
                  subSkillName = 'Attack'
                } else if (selectedAttackType === 'block') {
                  subSkillType = 'defence'
                  subSkillName = 'Defence'
                } else if (selectedAttackType === 'stab') {
                  subSkillType = 'agility'
                  subSkillName = 'Agility'
                }
                
                let subSkillXPLost = 0
                if (subSkillType) {
                  const currentSubStat = combatSubStats[subSkillType]
                  const currentCumulativeXP = getCumulativeExperience(currentSubStat.level) + currentSubStat.experience
                  subSkillXPLost = Math.floor(currentCumulativeXP * 0.05)
                  if (subSkillXPLost > 0) {
                    // Queue store update instead of calling directly
                    storeUpdates.push(() => removeCombatSubStatXP(subSkillType!, subSkillXPLost))
                  }
                }
              
              // Store XP loss for popup
              setDeathXPLoss({
                mainSkill: mainSkillXPLost,
                subSkill: subSkillXPLost,
                subSkillName: subSkillName
              })
              
              // Set health to 0 and reset enemy health
              setPlayerHealth(0)
              enemyHealthRef.current = currentEnemy.maxHealth
              setEnemyHealth(currentEnemy.maxHealth)
              
              // Stop combat and show popup
              onCombatStop()
              setShowDeathPopup(true)
              
              combatProcessingRef.current = false // Unlock
              return currentEnemy.maxHealth
            }
            
            // Update player health (only if not dead)
            setPlayerHealth(newPlayerHealth)
            
            combatProcessingRef.current = false // Unlock
            return actualEnemyHealth
          } else {
            // Turn doesn't match (shouldn't happen, but safety fallback)
            combatProcessingRef.current = false // Unlock
            return actualEnemyHealth
          }
        })
        return currentPlayerHealth
      })
      
          // Execute all queued store updates after state updates complete
          // Use queueMicrotask to ensure this happens after React's state updates
          queueMicrotask(() => {
            storeUpdates.forEach(update => update())
          })
        } catch (error) {
          // Ensure unlock on error
          combatProcessingRef.current = false
          console.error('Error in combatTick:', error)
        }
      }, 0) // Defer to next event loop to avoid render-phase updates
    }

    // Use dynamic attack speed - check every 100ms to see if attacks should happen
    const combatTimer = setInterval(() => {
      const currentStats = calculatePlayerStats()
      const playerAttackSpeed = currentStats.attackSpeed || 4000
      const enemyAttackSpeed = currentEnemy.attackSpeed || 4000
      
      const timeSincePlayerAttack = Date.now() - lastPlayerAttackTimeRef.current
      const timeSinceEnemyAttack = Date.now() - lastEnemyAttackTimeRef.current
      
      // Player attacks when their timer is up and it's their turn
      if (timeSincePlayerAttack >= playerAttackSpeed && attackerTurnRef.current === 'player') {
        combatTick()
      }
      // Enemy attacks when their timer is up and it's their turn
      else if (timeSinceEnemyAttack >= enemyAttackSpeed && attackerTurnRef.current === 'enemy') {
        combatTick()
      }
    }, 100) // Check every 100ms
    
    return () => {
      clearInterval(combatTimer)
    }
  }, [combatActive, currentEnemy, skillId, addGold, addXP, onCombatStop, selectedAttackType, addCombatSubStatXP, removeXP, removeCombatSubStatXP, skillCategories, equippedItems, combatSubStats])

  const addMessage = (message: string, type: CombatMessage['type']) => {
    setCombatLog((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
        timestamp: Date.now(),
      },
    ])
  }

  if (!currentEnemy) {
    return (
      <div className="combat-dashboard">
        <div className="no-enemy-selected">
          <p>Select an enemy from the combat zones to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="combat-dashboard">
      {/* Top Bar: Player and Enemy Health */}
      <div className="combat-top-bar">
        <div className="top-bar-player">
          <div className="top-bar-label">PLAYER</div>
          <div className="top-bar-health">
            <div className="health-bar-bg">
              <div 
                className="health-bar-fill player-health"
                style={{ width: `${(playerHealth / playerMaxHealth) * 100}%` }}
              ></div>
            </div>
            <div className="health-text">
              {playerHealth} / {playerMaxHealth}
            </div>
          </div>
          <div className="top-bar-speed">
            <div className="top-bar-speed-header">
              <span className="speed-icon">⚔️</span>
              <span className="speed-label">Attack Speed:</span>
              <span className="speed-value">{((playerStats.attackSpeed ?? 4000) / 1000).toFixed(2)}s</span>
            </div>
            <div className="speed-bar-container">
              <div className="speed-bar-bg">
                <div 
                  className="speed-bar-fill"
                  style={{ width: `${attackSpeedProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="top-bar-enemy">
          <div className="top-bar-label">ENEMY</div>
          <div className="top-bar-health">
            <div className="health-bar-bg">
              <div 
                className="health-bar-fill enemy-health"
                style={{ width: `${(enemyHealth / (currentEnemy?.maxHealth || 100)) * 100}%` }}
              ></div>
            </div>
          <div className="health-text">
            {enemyHealth} / {currentEnemy?.maxHealth || 100}
          </div>
          </div>
          <div className="top-bar-speed">
            <div>
              <span className="speed-icon">⚡</span>
              <span className="speed-label">Attack Speed:</span>
              <span className="speed-value">{(currentEnemy?.attackSpeed || 4000) / 1000}s</span>
            </div>
            <div className="speed-bar-container">
              <div className="speed-bar-bg">
                <div 
                  className="speed-bar-fill"
                  style={{ width: `${enemyAttackSpeedProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="top-bar-enemy-name">{currentEnemy?.name || 'None'}</div>
        </div>
      </div>

      <div className="combat-content">
        {/* First Column: Player Stats + Combat Styles */}
        <div className="combat-column">
          {/* Player Stats */}
          <div className="combat-panel stats-panel">
            <div className="panel-header">
              <h2 className="panel-title">STATS</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Max Hit:</span>
                <span className="stat-value">{playerStats.attack}</span>
              </div>
              {playerStats.equippedWeapon?.equipmentStats && (
                <div className="stat-item">
                  <span className="stat-label">Weapon Dmg:</span>
                  <span className="stat-value">{playerStats.equippedWeapon.equipmentStats.damage || 0}</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">Defense:</span>
                <span className="stat-value">{playerStats.defense}</span>
              </div>
              {currentEnemy && (
                <div className="stat-item">
                  <span className="stat-label">Hit Chance:</span>
                  <span className="stat-value">{calculateHitChance(selectedAttackType, currentEnemy, playerStats.accuracy, 0).toFixed(1)}%</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">{playerStats.accuracy.toFixed(0)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Crit:</span>
                <span className="stat-value">{playerStats.critChance.toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Crit Dmg:</span>
                <span className="stat-value">{playerStats.critDamage}%</span>
              </div>
            </div>
          </div>

          {/* Attack Type Selector */}
          <div className="combat-panel attack-style-panel">
            <div className="panel-header">
              <h2 className="panel-title">ATTACK STYLE</h2>
            </div>
            <div className="attack-type-buttons">
              <button
                className={`attack-type-btn ${selectedAttackType === 'bash' ? 'active' : ''}`}
                onClick={() => setSelectedAttackType('bash')}
                title="Bash - Trains Strength"
              >
                <span className="attack-icon">💪</span>
                <span className="attack-name">BASH</span>
                <span className="attack-stat">Str: {combatSubStats?.strength?.level || 0}</span>
              </button>
              <button
                className={`attack-type-btn ${selectedAttackType === 'cut' ? 'active' : ''}`}
                onClick={() => setSelectedAttackType('cut')}
                title="Cut - Trains Attack"
              >
                <span className="attack-icon">⚔️</span>
                <span className="attack-name">CUT</span>
                <span className="attack-stat">Atk: {combatSubStats?.attack?.level || 0}</span>
              </button>
              <button
                className={`attack-type-btn ${selectedAttackType === 'stab' ? 'active' : ''}`}
                onClick={() => setSelectedAttackType('stab')}
                title="Stab - Trains Agility"
              >
                <span className="attack-icon">🗡️</span>
                <span className="attack-name">STAB</span>
                <span className="attack-stat">Agi: {combatSubStats?.agility?.level || 0}</span>
              </button>
              <button
                className={`attack-type-btn ${selectedAttackType === 'block' ? 'active' : ''}`}
                onClick={() => setSelectedAttackType('block')}
                title="Block - Trains Defence"
              >
                <span className="attack-icon">🛡️</span>
                <span className="attack-name">BLOCK</span>
                <span className="attack-stat">Def: {combatSubStats?.defence?.level || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Column: Equipment + Consumables */}
        <div className="combat-column">
          {/* Equipment Grid */}
          <div className="combat-panel equipment-panel">
            <div className="panel-header">
              <h2 className="panel-title">EQUIPMENT</h2>
            </div>
            <div className="equipment-grid-container">
              <div className="equipment-grid">
                {Array.from({ length: 4 }, (_, rowIndex) =>
                  Array.from({ length: 3 }, (_, colIndex) => {
                    let emoji = null
                    
                    // Row 1: necklace, helmet, cape
                    if (rowIndex === 0 && colIndex === 0) emoji = '📿'
                    if (rowIndex === 0 && colIndex === 1) emoji = '⛑️'
                    if (rowIndex === 0 && colIndex === 2) emoji = '🧥'
                    
                    // Row 2: sword, armor, shield
                    if (rowIndex === 1 && colIndex === 0) emoji = '⚔️'
                    if (rowIndex === 1 && colIndex === 1) emoji = '🤺'
                    if (rowIndex === 1 && colIndex === 2) emoji = '🛡️'
                    
                    // Row 3: glove, pants, ring
                    if (rowIndex === 2 && colIndex === 0) emoji = '🧤'
                    if (rowIndex === 2 && colIndex === 1) emoji = '👖'
                    if (rowIndex === 2 && colIndex === 2) emoji = '💍'
                    
                    // Row 4: book, boots, bible
                    if (rowIndex === 3 && colIndex === 0) emoji = '📖'
                    if (rowIndex === 3 && colIndex === 1) emoji = '👢'
                    if (rowIndex === 3 && colIndex === 2) emoji = '📚'
                    
                    const slotKey = `${rowIndex}-${colIndex}`
                    const equippedItemId = equippedItems[slotKey]
                    const equippedItem = equippedItemId 
                      ? ENGINEERING_RECIPES.find(r => r.id === equippedItemId)
                      : null
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="equipment-cell"
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        style={{ cursor: 'pointer' }}
                      >
                        {equippedItem ? (
                          <span style={{ fontSize: '2rem' }}>{equippedItem.icon || '⚙️'}</span>
                        ) : (
                          emoji && <span style={{ fontSize: '2rem' }}>{emoji}</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Consumables */}
          <div className="combat-panel consumables-panel">
            <div className="panel-header">
              <h2 className="panel-title">CONSUMABLES</h2>
            </div>
            <div className="usable-items-grid">
              {/* Medical Item Slot */}
              <div
                className="usable-item-cell"
                onClick={() => handleCellClick('medical', 0)}
                style={{ cursor: 'pointer' }}
              >
                {equippedItems['medical'] ? (
                  <span style={{ fontSize: '2rem' }}>
                    {ENGINEERING_RECIPES.find(r => r.id === equippedItems['medical'])?.icon || '⚙️'}
                  </span>
                ) : (
                  <>
                    <span style={{ fontSize: '1.8rem' }}>💊</span>
                    <div className="usable-item-label">Medical</div>
                  </>
                )}
              </div>

              {/* Food Item Slot */}
              <div
                className="usable-item-cell"
                onClick={() => handleCellClick('food', 0)}
                style={{ cursor: 'pointer' }}
              >
                {equippedItems['food'] ? (
                  <span style={{ fontSize: '2rem' }}>
                    {ENGINEERING_RECIPES.find(r => r.id === equippedItems['food'])?.icon || '⚙️'}
                  </span>
                ) : (
                  <>
                    <span style={{ fontSize: '1.8rem' }}>🍖</span>
                    <div className="usable-item-label">Food</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Selection Popup */}
        {selectedEquipmentSlot && (
          <div className="equipment-popup-overlay" onClick={handleClosePopup}>
            <div className="equipment-popup" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>Select Equipment</h3>
                <button className="popup-close" onClick={handleClosePopup}>×</button>
              </div>
              <div className="popup-content">
                {getEquipmentForSlot(selectedEquipmentSlot).length === 0 ? (
                  <p className="no-equipment">No items of this type in inventory</p>
                ) : (
                  <div className="equipment-list">
                    {getEquipmentForSlot(selectedEquipmentSlot).map((item) => (
                      <div
                        key={item.id}
                        className="equipment-item-card"
                        onClick={() => handleEquipItem(item.id)}
                      >
                        <div className="item-icon">{item.icon || '⚙️'}</div>
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          <div className="item-quantity">x{item.quantity}</div>
                          <div className="item-description">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Third Column: Enemy Display and Combat Log */}
        <div className="combat-column">
          {/* Enemy Display */}
          <div className="combat-panel enemy-panel">
            <div className="panel-header">
              <h2 className="panel-title">ENEMY</h2>
            </div>
            <div className="enemy-display">
              <div className={`enemy-image-container ${enemyHitAnimation ? enemyHitAnimation : ''}`}>
                {searchingForEnemy ? (
                  // Searching animation
                  <div className="enemy-searching">
                    <div className="searching-icon">🔍</div>
                    <div className="searching-text">Searching for enemy...</div>
                    <div className="searching-pulse"></div>
                  </div>
                ) : (
                  <>
                    {/* Enemy Attacks Overlay - Top Right */}
                    <div className="enemy-attacks-overlay">
                      {currentEnemy.attacks.map((attack, idx) => (
                        <div key={idx} className="enemy-attack-badge">
                          <span className="attack-name">{attack.name}</span>
                          <span className="attack-damage">{attack.damage} {attack.type}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="enemy-image">{currentEnemy.image}</div>
                    <div className="enemy-name">{currentEnemy.name}</div>
                    <div className="enemy-level">Level {currentEnemy.level}</div>
                  </>
                )}
              </div>
              
              <div className="enemy-info-box">
                <div className="info-section">
                  <h3 className="info-title">DEFENSES</h3>
                  <div className="info-content">
                    {currentEnemy.takesDamage.map((defense, idx) => (
                      <div key={idx} className="info-item">
                        <span className="info-label">{defense.from}:</span>
                        <span className="info-value">
                          {defense.multiplier > 1 ? '+' : ''}
                          {((defense.multiplier - 1) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="combat-panel combat-log-panel">
            <div className="panel-header">
              <h2 className="panel-title">COMBAT LOG</h2>
            </div>
            <div className="combat-log-container">
              <div className="combat-log">
                {combatLog.length === 0 ? (
                  <div className="log-empty">
                    <p>No combat activity yet...</p>
                  </div>
                ) : (
                  combatLog.map((message) => (
                    <div key={message.id} className={`log-message log-${message.type}`}>
                      {message.message}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Death Popup */}
      {showDeathPopup && (
        <DeathPopup
          mainSkillXPLost={deathXPLoss.mainSkill}
          subSkillXPLost={deathXPLoss.subSkill}
          subSkillName={deathXPLoss.subSkillName}
          onResume={handleResumeFromDeath}
        />
      )}
    </div>
  )
}

