import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Enemy } from '../types/enemies'
import { ENGINEERING_RECIPES } from '../types/engineeringResources'
import DeathPopup from './DeathPopup'
import { getCumulativeExperience } from '../utils/experience'
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

type AttackType = 'bash' | 'cut' | 'block' | 'stab'

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
  const combatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)
  const attackerTurnRef = useRef<'player' | 'enemy'>('player')
  const lastPlayerAttackTimeRef = useRef<number>(0)
  const lastEnemyAttackTimeRef = useRef<number>(0)
  const hasDiedRef = useRef<boolean>(false)

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
        equippedWeapon: null,
      }
    }
    
    // Sum stats from all equipped items
    Object.entries(equippedItems).forEach(([slotKey, itemId]) => {
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
    
    // Strength: increases max damage output and crit damage
    const strengthDamageBonus = (combatSubStats.strength?.level || 0) * 2 // +2 damage per level
    const strengthCritDamageBonus = (combatSubStats.strength?.level || 0) * 5 // +5% crit damage per level
    const finalDamage = baseDamage + strengthDamageBonus
    const baseCritDamage = 150 + strengthCritDamageBonus
    
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
    // Each agility level reduces attack speed by 2% (minimum 500ms)
    const baseAttackSpeed = 4000 // Base attack speed in milliseconds (4 seconds)
    const agilityReduction = (combatSubStats.agility?.level || 0) * 0.02 // 2% per level
    const finalAttackSpeed = Math.max(500, baseAttackSpeed * (1 - agilityReduction))
    
    return {
      attack: finalDamage,
      defense: finalArmor,
      health: playerMaxHealth,
      accuracy: totalAccuracy,
      critChance: Math.min(50, totalCritChance), // Cap at 50%
      critDamage: baseCritDamage,
      attackSpeed: finalAttackSpeed,
      equippedWeapon,
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
    if (!combatActive || !currentEnemy) {
      setAttackSpeedProgress(0)
      return
    }

    const progressInterval = setInterval(() => {
      if (lastPlayerAttackTimeRef.current === 0) {
        setAttackSpeedProgress(0)
        return
      }
      const currentStats = calculatePlayerStats()
      const attackSpeed = currentStats.attackSpeed || 4000
      const elapsed = Date.now() - lastPlayerAttackTimeRef.current
      const progress = Math.min(Math.max(0, (elapsed / attackSpeed) * 100), 100)
      setAttackSpeedProgress(progress)
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(progressInterval)
  }, [combatActive, currentEnemy, equippedItems, combatSubStats])

  // Attack speed progress bar update for enemy
  useEffect(() => {
    if (!combatActive || !currentEnemy) {
      setEnemyAttackSpeedProgress(0)
      return
    }

    const progressInterval = setInterval(() => {
      if (lastEnemyAttackTimeRef.current === 0) {
        setEnemyAttackSpeedProgress(0)
        return
      }
      const enemyAttackSpeed = currentEnemy.attackSpeed || 4000
      const elapsed = Date.now() - lastEnemyAttackTimeRef.current
      const progress = Math.min(Math.max(0, (elapsed / enemyAttackSpeed) * 100), 100)
      setEnemyAttackSpeedProgress(progress)
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(progressInterval)
  }, [combatActive, currentEnemy])

  // Combat loop
  useEffect(() => {
    if (!combatActive || !currentEnemy) {
      if (combatIntervalRef.current) {
        clearInterval(combatIntervalRef.current)
        combatIntervalRef.current = null
      }
      return
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
        setEnemyHealth(currentEnemy.maxHealth)
      }
      // Reset progress bars to 0 when starting
      setAttackSpeedProgress(0)
      setEnemyAttackSpeedProgress(0)
    }

    const combatTick = () => {
      // Get current state values for this tick
      setPlayerHealth((currentPlayerHealth) => {
        setEnemyHealth((currentEnemyHealth) => {
          // Check if combat should stop (player or enemy dead)
          if (currentPlayerHealth <= 0) {
            // Check if death has already been handled
            if (hasDiedRef.current) {
              return currentEnemyHealth // Already handled, don't process again
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
                removeXP(skillId, mainSkillXPLost)
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
                removeCombatSubStatXP(subSkillType, subSkillXPLost)
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
            setEnemyHealth(currentEnemy.maxHealth)
            
            // Stop combat and show popup
            onCombatStop()
            setShowDeathPopup(true)
            
            return currentEnemy.maxHealth
          }

          if (currentEnemyHealth <= 0) {
            // Enemy defeated
            addMessage(`You defeated ${currentEnemy.name}!`, 'info')
            addXP(skillId, currentEnemy.xpReward)
            addGold(currentEnemy.goldReward)
            addMessage(`Gained ${currentEnemy.xpReward} XP and ${currentEnemy.goldReward} gold`, 'info')
            
            // Reset enemy health and continue combat (player keeps attacking)
            return currentEnemy.maxHealth
          }

          // Combat continues
          if (attackerTurnRef.current === 'player') {
            // Recalculate stats for this tick
            const currentStats = calculatePlayerStats()
            
            // Player attacks - determine attack type and XP
            let attackMessage = ''
            let xpToAward = currentEnemy.xpReward // Base XP from enemy
            let statToTrain: 'strength' | 'attack' | 'defence' | null = null
            
            // Check if equipped weapon has preferred attack type and apply attack scale
            const equippedWeapon = currentStats.equippedWeapon
            let xpMultiplier = 1.0
            if (equippedWeapon?.equipmentStats) {
              // If using the weapon's preferred attack type, apply attack scale
              if (selectedAttackType === equippedWeapon.equipmentStats.attackType) {
                xpMultiplier = equippedWeapon.equipmentStats.attackScale
              }
            }
            xpToAward = Math.floor(xpToAward * xpMultiplier)
            
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
              // Award XP for defence training
              if (statToTrain) {
                addCombatSubStatXP(statToTrain, xpToAward)
              }
              attackerTurnRef.current = 'enemy'
              lastPlayerAttackTimeRef.current = Date.now()
              setLastAttackTime(Date.now())
              return currentEnemyHealth // No damage dealt, but XP awarded
            }
            
            // Calculate damage (bash, cut, and stab deal damage)
            // Calculate hit chance using the formula: H = Aff × (a / d) + m
            const hitChance = calculateHitChance(selectedAttackType, currentEnemy, currentStats.accuracy, 0)
            
            // If hit chance is less than 1%, all attacks miss
            if (hitChance < 1) {
              addMessage(`You miss ${currentEnemy.name}!`, 'player-damage')
              attackerTurnRef.current = 'enemy'
              lastPlayerAttackTimeRef.current = Date.now()
              setLastAttackTime(Date.now())
              return currentEnemyHealth
            }
            
            // Calculate base damage
            const baseDamage = currentStats.attack
            const isCrit = Math.random() * 100 < currentStats.critChance
            const critDamage = Math.floor(isCrit ? baseDamage * (currentStats.critDamage / 100) : baseDamage)
            
            // Scale damage by hit chance (1-100% scales damage, <1% = miss)
            // Hit chance acts as damage potential multiplier
            const damagePotential = hitChance / 100
            const damage = Math.floor(critDamage * damagePotential)
            
            const defenseMultiplier = currentEnemy.takesDamage.find(d => d.from === 'physical')?.multiplier || 1.0
            const finalDamage = Math.floor(damage * defenseMultiplier)
            
            // Award XP to the appropriate sub-stat (already handled for block above)
            if (statToTrain && selectedAttackType !== 'block') {
              addCombatSubStatXP(statToTrain, xpToAward)
            }
            
            if (isCrit) {
              addMessage(`${attackMessage} ${finalDamage} damage (CRITICAL!) to ${currentEnemy.name}`, 'player-damage')
            } else {
              addMessage(`${attackMessage} ${finalDamage} damage to ${currentEnemy.name}`, 'player-damage')
            }
            
            attackerTurnRef.current = 'enemy'
            lastPlayerAttackTimeRef.current = Date.now()
            setLastAttackTime(Date.now())
            return Math.max(0, currentEnemyHealth - finalDamage)
          } else {
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
              attackerTurnRef.current = 'player'
              lastEnemyAttackTimeRef.current = Date.now()
              setLastEnemyAttackTime(Date.now())
              return currentEnemyHealth
            }
            
            // Scale enemy damage by hit chance (damage potential)
            const enemyDamagePotential = finalEnemyHitChance / 100
            
            // Calculate damage mitigation from armor and defence skill
            // Defence skill provides % damage reduction
            const defenceMitigation = (combatSubStats?.defence?.level || 0) * 1 // +1% per level, capped at some max
            const armorReduction = Math.min(50, currentStats.defense * 2) // Each armor point = 2% reduction, cap at 50%
            const totalMitigation = Math.min(75, defenceMitigation + armorReduction) // Cap total at 75%
            
            let defenseMultiplier = 1.0 - (totalMitigation / 100)
            
            // Block reduces incoming damage significantly (stacking with armor/defence)
            const isBlocking = selectedAttackType === 'block'
            if (isBlocking) {
              defenseMultiplier = Math.max(0.25, defenseMultiplier * 0.5) // Block reduces remaining damage by 50%
            }
            
            // Scale base damage by hit chance (damage potential)
            const baseDamage = Math.floor(attack.damage * enemyDamagePotential)
            const damage = Math.floor(baseDamage * Math.max(0.1, defenseMultiplier))
            
            if (isBlocking) {
              addMessage(`${currentEnemy.name} deals ${damage} ${attack.type} damage to you (BLOCKED)`, 'enemy-damage')
            } else {
              addMessage(`${currentEnemy.name} deals ${damage} ${attack.type} damage to you`, 'enemy-damage')
            }
            
            attackerTurnRef.current = 'player'
            lastEnemyAttackTimeRef.current = Date.now()
            setLastEnemyAttackTime(Date.now())
            setPlayerHealth((prev) => Math.max(0, prev - damage))
            return currentEnemyHealth
          }
        })
        return currentPlayerHealth
      })
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
              <span className="speed-value">{(playerStats.attackSpeed / 1000).toFixed(2)}s</span>
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
                <span className="stat-label">Attack:</span>
                <span className="stat-value">{playerStats.attack}</span>
              </div>
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
              <div className="enemy-image-container">
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

