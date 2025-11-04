import { useState } from 'react'
import { DUNGEONS, Enemy, DungeonCategory } from '../types/enemies'
import './DungeonSelector.css'

interface DungeonSelectorProps {
  onEnemySelect: (enemy: Enemy) => void
  onStartCombat: () => void
  onStopCombat: () => void
  selectedEnemy: Enemy | null
  combatActive: boolean
}

const DUNGEON_CATEGORIES: { id: DungeonCategory; name: string; icon: string }[] = [
  { id: 'standard', name: 'STANDARD ENGAGEMENTS', icon: '⚔️' },
  { id: 'veteran', name: 'VETERAN OPERATIONS', icon: '🎖️' },
  { id: 'chaos-infested', name: 'CHAOS-INFESTED ZONES', icon: '💀' },
  { id: 'daemon-princes', name: 'DAEMON PRINCES', icon: '👹' },
  { id: 'forbidden-relics', name: 'FORBIDDEN RELICS', icon: '🔮' },
]

export default function DungeonSelector({ onEnemySelect, onStartCombat, onStopCombat, selectedEnemy, combatActive }: DungeonSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<DungeonCategory>('standard')
  const [expandedDungeon, setExpandedDungeon] = useState<string | null>(null)

  const filteredDungeons = DUNGEONS.filter((dungeon) => dungeon.category === activeCategory)

  const handleDungeonClick = (dungeonId: string) => {
    if (expandedDungeon === dungeonId) {
      setExpandedDungeon(null)
    } else {
      setExpandedDungeon(dungeonId)
    }
  }

  return (
    <div className="dungeon-selector">
      <div className="selector-header">
        <h2 className="selector-title">COMBAT ZONES</h2>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {DUNGEON_CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(category.id)
              setExpandedDungeon(null) // Close any expanded dungeon when switching tabs
            }}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="zones-container">
        {filteredDungeons.length > 0 ? (
          filteredDungeons.map((dungeon) => (
          <div key={dungeon.id} className="zone-card">
            <div
              className={`zone-card-header ${expandedDungeon === dungeon.id ? 'expanded' : ''}`}
              onClick={() => handleDungeonClick(dungeon.id)}
            >
              <div className="zone-card-left">
                <div className="zone-name">{dungeon.name}</div>
                <div className="zone-meta">
                  <span className="zone-level">Level {dungeon.level}+</span>
                  <span className="zone-separator">•</span>
                  <span className="zone-count">{dungeon.enemies.length} Enemies</span>
                </div>
              </div>
              <div className="zone-toggle">
                {expandedDungeon === dungeon.id ? '−' : '+'}
              </div>
            </div>

            {expandedDungeon === dungeon.id && (
              <div className="zone-enemies">
                {dungeon.enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className={`enemy-card ${selectedEnemy?.id === enemy.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEnemySelect(enemy)
                    }}
                  >
                    <div className="enemy-card-image">{enemy.image}</div>
                    <div className="enemy-card-info">
                      <div className="enemy-card-name">{enemy.name}</div>
                      <div className="enemy-card-level">Level {enemy.level}</div>
                    </div>
                    <div className="enemy-card-stats">
                      <span className="enemy-stat-compact">HP: {enemy.maxHealth}</span>
                      <span className="enemy-stat-compact">XP: {enemy.xpReward}</span>
                      <span className="enemy-stat-compact">Gold: {enemy.goldReward}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
        ) : (
          <div className="no-dungeons">
            <p>No zones available in this category</p>
          </div>
        )}
      </div>

      {/* Start/Stop Combat Button */}
      {selectedEnemy && (
        <div className="combat-controls">
          <button
            className={`start-combat-button ${combatActive ? 'stop-combat' : ''}`}
            onClick={combatActive ? onStopCombat : onStartCombat}
          >
            {combatActive ? 'STOP COMBAT' : 'START COMBAT'}
          </button>
          <div className="selected-enemy-preview">
            Selected: <span className="preview-name">{selectedEnemy.name}</span>
            (Level {selectedEnemy.level})
          </div>
        </div>
      )}
    </div>
  )
}

