import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './SkillTree.css'
import { useGameStore } from '../stores/gameStore'

// Define skill tree structure with prerequisites
interface SkillTreeNode {
  id: string
  name: string
  icon: string
  description: string
  prerequisites?: string[] // IDs of required skills
  position: { x: number; y: number }
}

// Large skill tree with starting points at top, branching downward
const SKILL_TREE_DATA: SkillTreeNode[] = [
  // ========== COMBAT BRANCH - Starting Points (Top Row) ==========
  {
    id: 'bolter-training',
    name: 'Bolter Training',
    icon: '🔫',
    description: 'Master the sacred art of bolter warfare',
    prerequisites: [],
    position: { x: 200, y: 0 },
  },
  {
    id: 'melee-combat',
    name: 'Melee Combat',
    icon: '⚔️',
    description: 'Close quarters combat training',
    prerequisites: [],
    position: { x: 600, y: 0 },
  },
  {
    id: 'psykana',
    name: 'Psykana',
    icon: '✨',
    description: 'Wield the power of the warp',
    prerequisites: [],
    position: { x: 1000, y: 0 },
  },
  {
    id: 'stealth',
    name: 'Stealth',
    icon: '🥷',
    description: 'Move unseen in the shadows',
    prerequisites: [],
    position: { x: 1400, y: 0 },
  },

  // ========== BOLTER BRANCH (Row 2) ==========
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    icon: '🔫',
    description: 'Increase bolter fire rate',
    prerequisites: ['bolter-training'],
    position: { x: 100, y: 200 },
  },
  {
    id: 'precision-shot',
    name: 'Precision Shot',
    icon: '🎯',
    description: 'Improved accuracy with ranged weapons',
    prerequisites: ['bolter-training'],
    position: { x: 300, y: 200 },
  },

  // ========== MELEE BRANCH (Row 2) ==========
  {
    id: 'sword-mastery',
    name: 'Sword Mastery',
    icon: '⚔️',
    description: 'Master the blade',
    prerequisites: ['melee-combat'],
    position: { x: 500, y: 200 },
  },
  {
    id: 'chain-weapon',
    name: 'Chain Weapon',
    icon: '⚙️',
    description: 'Wield chainswords and chainaxes',
    prerequisites: ['melee-combat'],
    position: { x: 700, y: 200 },
  },

  // ========== PSYKANA BRANCH (Row 2) ==========
  {
    id: 'smite',
    name: 'Smite',
    icon: '⚡',
    description: 'Basic psychic attack',
    prerequisites: ['psykana'],
    position: { x: 900, y: 200 },
  },
  {
    id: 'mind-shield',
    name: 'Mind Shield',
    icon: '🛡️',
    description: 'Psychic defensive barrier',
    prerequisites: ['psykana'],
    position: { x: 1100, y: 200 },
  },

  // ========== STEALTH BRANCH (Row 2) ==========
  {
    id: 'silent-kill',
    name: 'Silent Kill',
    icon: '🗡️',
    description: 'Eliminate enemies quietly',
    prerequisites: ['stealth'],
    position: { x: 1300, y: 200 },
  },
  {
    id: 'shadow-step',
    name: 'Shadow Step',
    icon: '👻',
    description: 'Teleport through shadows',
    prerequisites: ['stealth'],
    position: { x: 1500, y: 200 },
  },

  // ========== ADVANCED BOLTER (Row 3) ==========
  {
    id: 'advanced-bolter',
    name: 'Advanced Bolter',
    icon: '🔫',
    description: 'Enhanced bolter techniques',
    prerequisites: ['rapid-fire', 'precision-shot'],
    position: { x: 200, y: 400 },
  },
  {
    id: 'explosive-rounds',
    name: 'Explosive Rounds',
    icon: '💥',
    description: 'Bolter rounds that explode on impact',
    prerequisites: ['rapid-fire'],
    position: { x: 0, y: 400 },
  },
  {
    id: 'armor-piercing',
    name: 'Armor Piercing',
    icon: '🔩',
    description: 'Rounds that penetrate armor',
    prerequisites: ['precision-shot'],
    position: { x: 400, y: 400 },
  },

  // ========== ADVANCED MELEE (Row 3) ==========
  {
    id: 'dual-wield',
    name: 'Dual Wield',
    icon: '⚔️',
    description: 'Wield two weapons simultaneously',
    prerequisites: ['sword-mastery', 'chain-weapon'],
    position: { x: 600, y: 400 },
  },
  {
    id: 'berserker-rage',
    name: 'Berserker Rage',
    icon: '😡',
    description: 'Enter a state of enhanced melee combat',
    prerequisites: ['chain-weapon'],
    position: { x: 800, y: 400 },
  },

  // ========== ADVANCED PSYKANA (Row 3) ==========
  {
    id: 'psychic-storm',
    name: 'Psychic Storm',
    icon: '🌩️',
    description: 'Area of effect psychic attack',
    prerequisites: ['smite', 'mind-shield'],
    position: { x: 1000, y: 400 },
  },
  {
    id: 'telekinesis',
    name: 'Telekinesis',
    icon: '🧠',
    description: 'Move objects with your mind',
    prerequisites: ['smite'],
    position: { x: 1200, y: 400 },
  },

  // ========== ADVANCED STEALTH (Row 3) ==========
  {
    id: 'invisibility',
    name: 'Invisibility',
    icon: '👁️',
    description: 'Become completely invisible',
    prerequisites: ['silent-kill', 'shadow-step'],
    position: { x: 1400, y: 400 },
  },
  {
    id: 'assassinate',
    name: 'Assassinate',
    icon: '💀',
    description: 'Instant kill from stealth',
    prerequisites: ['silent-kill'],
    position: { x: 1600, y: 400 },
  },

  // ========== MASTER LEVEL - COMBAT FUSION (Row 4) ==========
  {
    id: 'imperial-tactics',
    name: 'Imperial Tactics',
    icon: '🛡️',
    description: 'Strategic warfare knowledge',
    prerequisites: ['advanced-bolter', 'dual-wield'],
    position: { x: 400, y: 600 },
  },
  {
    id: 'gun-kata',
    name: 'Gun Kata',
    icon: '🎭',
    description: 'Combine ranged and melee seamlessly',
    prerequisites: ['advanced-bolter', 'dual-wield'],
    position: { x: 600, y: 600 },
  },
  {
    id: 'psyker-warrior',
    name: 'Psyker Warrior',
    icon: '⚡',
    description: 'Combine psychic powers with combat',
    prerequisites: ['psychic-storm', 'dual-wield'],
    position: { x: 800, y: 600 },
  },
  {
    id: 'shadow-warrior',
    name: 'Shadow Warrior',
    icon: '🌑',
    description: 'Master of stealth and combat',
    prerequisites: ['invisibility', 'dual-wield'],
    position: { x: 1000, y: 600 },
  },

  // ========== ELITE LEVEL (Row 5) ==========
  {
    id: 'elite-tactics',
    name: 'Elite Tactics',
    icon: '👑',
    description: 'Advanced strategic warfare',
    prerequisites: ['imperial-tactics', 'gun-kata'],
    position: { x: 500, y: 800 },
  },
  {
    id: 'warp-rage',
    name: 'Warp Rage',
    icon: '🔥',
    description: 'Channel warp energy into combat fury',
    prerequisites: ['psyker-warrior', 'berserker-rage'],
    position: { x: 700, y: 800 },
  },
  {
    id: 'void-stalker',
    name: 'Void Stalker',
    icon: '🌌',
    description: 'Move through the void unseen',
    prerequisites: ['shadow-warrior', 'invisibility'],
    position: { x: 900, y: 800 },
  },

  // ========== LEGENDARY LEVEL (Row 6) ==========
  {
    id: 'primarch-blessing',
    name: 'Primarch Blessing',
    icon: '⭐',
    description: 'The ultimate combat mastery',
    prerequisites: ['elite-tactics', 'warp-rage', 'void-stalker'],
    position: { x: 700, y: 1000 },
  },

  // ========== NON-COMBAT BRANCHES - Starting Points ==========
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '🔧',
    description: 'Design and construct machinery',
    prerequisites: [],
    position: { x: 200, y: 1200 },
  },
  {
    id: 'salvaging',
    name: 'Salvaging',
    icon: '🗑️',
    description: 'Recover materials from wreckage',
    prerequisites: [],
    position: { x: 600, y: 1200 },
  },
  {
    id: 'medicae',
    name: 'Medicae',
    icon: '⚕️',
    description: 'Heal wounds and maintain health',
    prerequisites: [],
    position: { x: 1000, y: 1200 },
  },
  {
    id: 'research',
    name: 'Research',
    icon: '📚',
    description: 'Unlock new technologies',
    prerequisites: [],
    position: { x: 1400, y: 1200 },
  },

  // ========== ENGINEERING BRANCH (Row 2) ==========
  {
    id: 'weapon-crafting',
    name: 'Weapon Crafting',
    icon: '🔨',
    description: 'Craft advanced weapons',
    prerequisites: ['engineering'],
    position: { x: 100, y: 1400 },
  },
  {
    id: 'armor-crafting',
    name: 'Armor Crafting',
    icon: '🛡️',
    description: 'Craft protective armor',
    prerequisites: ['engineering'],
    position: { x: 300, y: 1400 },
  },

  // ========== SALVAGING BRANCH (Row 2) ==========
  {
    id: 'advanced-salvage',
    name: 'Advanced Salvage',
    icon: '⚙️',
    description: 'Recover rare materials',
    prerequisites: ['salvaging'],
    position: { x: 500, y: 1400 },
  },
  {
    id: 'scrap-master',
    name: 'Scrap Master',
    icon: '♻️',
    description: 'Maximize material recovery',
    prerequisites: ['salvaging'],
    position: { x: 700, y: 1400 },
  },

  // ========== MEDICAE BRANCH (Row 2) ==========
  {
    id: 'field-medic',
    name: 'Field Medic',
    icon: '🏥',
    description: 'Heal in combat situations',
    prerequisites: ['medicae'],
    position: { x: 900, y: 1400 },
  },
  {
    id: 'biochem',
    name: 'Biochemistry',
    icon: '🧪',
    description: 'Create advanced medical items',
    prerequisites: ['medicae'],
    position: { x: 1100, y: 1400 },
  },

  // ========== RESEARCH BRANCH (Row 2) ==========
  {
    id: 'tech-research',
    name: 'Tech Research',
    icon: '💻',
    description: 'Research new technologies',
    prerequisites: ['research'],
    position: { x: 1300, y: 1400 },
  },
  {
    id: 'xeno-studies',
    name: 'Xeno Studies',
    icon: '👽',
    description: 'Study alien technology',
    prerequisites: ['research'],
    position: { x: 1500, y: 1400 },
  },

  // ========== MASTER CRAFTING (Row 3) ==========
  {
    id: 'master-crafter',
    name: 'Master Crafter',
    icon: '⭐',
    description: 'Craft legendary equipment',
    prerequisites: ['weapon-crafting', 'armor-crafting', 'advanced-salvage'],
    position: { x: 400, y: 1600 },
  },
  {
    id: 'archmagos',
    name: 'Archmagos',
    icon: '🤖',
    description: 'Ultimate engineering mastery',
    prerequisites: ['master-crafter', 'tech-research'],
    position: { x: 600, y: 1600 },
  },

  // ========== MASTER HEALING (Row 3) ==========
  {
    id: 'apothecary',
    name: 'Apothecary',
    icon: '💊',
    description: 'Master of medical arts',
    prerequisites: ['field-medic', 'biochem'],
    position: { x: 1000, y: 1600 },
  },
  {
    id: 'geneticist',
    name: 'Geneticist',
    icon: '🧬',
    description: 'Manipulate genetics for enhancement',
    prerequisites: ['biochem', 'xeno-studies'],
    position: { x: 1200, y: 1600 },
  },
]

// Custom node component for skills
const SkillNode = ({ data }: { data: any }) => {
  const { skill, unlocked, canUnlock, onNodeClick } = data
  const isLocked = !unlocked && !canUnlock
  const isUnlocked = unlocked

  return (
    <div
      className={`skill-node ${isUnlocked ? 'unlocked' : ''} ${isLocked ? 'locked' : 'available'}`}
      onClick={() => onNodeClick && onNodeClick(skill.id)}
    >
      <Handle type="target" position={Position.Top} />
      <div className="skill-node-content">
        <div className="skill-icon">{skill.icon}</div>
        <div className="skill-name">{skill.name}</div>
        {isUnlocked && <div className="skill-badge">✓</div>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  skill: SkillNode,
}

export const SkillTree: React.FC = () => {
  const { skillCategories } = useGameStore()

  // Get unlocked skills from store
  const unlockedSkills = useMemo(() => {
    const unlocked = new Set<string>()
    skillCategories.forEach((category) => {
      category.skills.forEach((skill) => {
        if (skill.level > 1) {
          unlocked.add(skill.id)
        }
      })
    })
    return unlocked
  }, [skillCategories])

  // Check if a skill can be unlocked (all prerequisites met)
  const canUnlockSkill = useCallback(
    (skill: SkillTreeNode) => {
      if (!skill.prerequisites || skill.prerequisites.length === 0) {
        return true // No prerequisites
      }
      return skill.prerequisites.every((prereq) => unlockedSkills.has(prereq))
    },
    [unlockedSkills]
  )

  // Handle node click
  const onNodeClick = useCallback((skillId: string) => {
    const skill = SKILL_TREE_DATA.find((s) => s.id === skillId)
    if (skill && canUnlockSkill(skill) && !unlockedSkills.has(skillId)) {
      // Here you would unlock the skill - for now just log
      console.log('Unlock skill:', skillId)
      // You could add: useGameStore.getState().unlockSkill(skillId)
    }
  }, [canUnlockSkill, unlockedSkills])

  // Convert skill tree data to React Flow nodes
  const nodes: Node[] = useMemo(
    () =>
      SKILL_TREE_DATA.map((skill) => {
        const unlocked = unlockedSkills.has(skill.id)
        const canUnlock = canUnlockSkill(skill)

        return {
          id: skill.id,
          type: 'skill',
          position: skill.position,
          data: {
            skill,
            unlocked,
            canUnlock,
            onNodeClick,
          },
        }
      }),
    [unlockedSkills, canUnlockSkill, onNodeClick]
  )

  // Create edges based on prerequisites
  const edges: Edge[] = useMemo(
    () =>
      SKILL_TREE_DATA.flatMap((skill) => {
        if (!skill.prerequisites || skill.prerequisites.length === 0) {
          return []
        }
        return skill.prerequisites.map((prereq) => ({
          id: `${prereq}-${skill.id}`,
          source: prereq,
          target: skill.id,
          type: 'smoothstep',
          animated: unlockedSkills.has(skill.id), // Animate if unlocked
          style: {
            stroke: unlockedSkills.has(skill.id) ? '#ff6b6b' : '#8b0000',
            strokeWidth: unlockedSkills.has(skill.id) ? 3 : 2,
            opacity: unlockedSkills.has(skill.id) ? 0.8 : 0.3,
          },
        }))
      }),
    [unlockedSkills]
  )

  return (
    <div className="skill-tree-container">
      <div className="skill-tree-header">
        <h2>Skill Tree</h2>
        <p>Click on available skills to unlock them</p>
      </div>
      <div className="skill-tree-view">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.1, maxZoom: 1.5 }}
          attributionPosition="bottom-left"
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

