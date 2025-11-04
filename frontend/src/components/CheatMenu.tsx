// CHEAT MENU - REMOVE THIS FILE BEFORE PRODUCTION
// To disable: Delete this file and remove the import/usage in App.tsx or Header.tsx

import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { BUILDING_DEFINITIONS } from '../types/village'
import './CheatMenu.css'

export default function CheatMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    gold,
    addGold,
    skillCategories,
    addXP,
    addResource,
    village,
    cheatCompleteBuilding,
    cheatAddVillageResource,
    cheatAddWorker,
  } = useGameStore()

  const handleAddGold = (amount: number) => {
    addGold(amount)
  }

  const handleAddSkillXP = (skillId: string, amount: number) => {
    addXP(skillId, amount)
  }

  const handleMaxSkill = (skillId: string) => {
    // Add enough XP to reach level 100 (approximately)
    const largeXP = 10000000
    addXP(skillId, largeXP)
  }

  const handleAddResource = (resourceId: string, amount: number) => {
    addResource(resourceId, amount)
  }

  // Get all skills from all categories
  const allSkills = skillCategories.flatMap((category) => category.skills)

  if (!isOpen) {
    return (
      <button
        className="cheat-menu-toggle"
        onClick={() => setIsOpen(true)}
        title="Cheat Menu (Remove in production)"
      >
        🎮
      </button>
    )
  }

  return (
    <div className="cheat-menu-overlay">
      <div className="cheat-menu">
        <div className="cheat-menu-header">
          <h2>🎮 Cheat Menu</h2>
          <button className="cheat-menu-close" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="cheat-menu-content">
          {/* Gold Section */}
          <div className="cheat-section">
            <h3>💰 Gold</h3>
            <div className="cheat-current">Current: {gold.toLocaleString()}</div>
            <div className="cheat-buttons">
              <button onClick={() => handleAddGold(1000)}>+1,000</button>
              <button onClick={() => handleAddGold(10000)}>+10,000</button>
              <button onClick={() => handleAddGold(100000)}>+100,000</button>
              <button onClick={() => handleAddGold(1000000)}>+1,000,000</button>
            </div>
          </div>

          {/* Skills Section */}
          <div className="cheat-section">
            <h3>📚 Skills</h3>
            <div className="cheat-skills-list">
              {allSkills.map((skill) => (
                <div key={skill.id} className="cheat-skill-item">
                  <div className="cheat-skill-info">
                    <span className="cheat-skill-icon">{skill.icon}</span>
                    <span className="cheat-skill-name">{skill.name}</span>
                    <span className="cheat-skill-level">Lv.{skill.level}</span>
                  </div>
                  <div className="cheat-skill-buttons">
                    <button onClick={() => handleAddSkillXP(skill.id, 1000)}>+1K XP</button>
                    <button onClick={() => handleAddSkillXP(skill.id, 10000)}>+10K XP</button>
                    <button onClick={() => handleMaxSkill(skill.id)}>Max Level</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources Section */}
          <div className="cheat-section">
            <h3>📦 Resources</h3>
            <div className="cheat-resources">
              <div className="cheat-resource-item">
                <span>Scrap Metal</span>
                <button onClick={() => handleAddResource('scrap-metal', 100)}>+100</button>
              </div>
              <div className="cheat-resource-item">
                <span>Plasteel Shards</span>
                <button onClick={() => handleAddResource('plasteel-shards', 100)}>+100</button>
              </div>
              <div className="cheat-resource-item">
                <span>Placeholder Metal 1</span>
                <button onClick={() => handleAddResource('placeholder-metal-1', 100)}>+100</button>
              </div>
              <div className="cheat-resource-item">
                <span>Placeholder Metal 2</span>
                <button onClick={() => handleAddResource('placeholder-metal-2', 100)}>+100</button>
              </div>
            </div>
          </div>

          {/* Colony Section */}
          <div className="cheat-section">
            <h3>🏘️ Colony</h3>
            
            {/* Village Resources */}
            <div className="cheat-subsection">
              <h4>Village Resources</h4>
              <div className="cheat-buttons">
                <button onClick={() => cheatAddVillageResource('wood', 100)}>+100 Wood</button>
                <button onClick={() => cheatAddVillageResource('wood', 500)}>+500 Wood</button>
                <button onClick={() => cheatAddVillageResource('stone', 100)}>+100 Stone</button>
                <button onClick={() => cheatAddVillageResource('stone', 500)}>+500 Stone</button>
                <button onClick={() => cheatAddVillageResource('food', 50)}>+50 Food</button>
                <button onClick={() => cheatAddVillageResource('herbs', 50)}>+50 Herbs</button>
              </div>
            </div>

            {/* Workers */}
            <div className="cheat-subsection">
              <h4>Workers</h4>
              <div className="cheat-current">Current: {village.villagers.length} workers</div>
              <div className="cheat-buttons">
                <button onClick={() => cheatAddWorker()}>+1 Worker</button>
                <button onClick={() => {
                  for (let i = 0; i < 5; i++) cheatAddWorker()
                }}>+5 Workers</button>
              </div>
            </div>

            {/* Complete Buildings */}
            {village.constructionQueue.length > 0 && (
              <div className="cheat-subsection">
                <h4>Complete Buildings</h4>
                <div className="cheat-buildings-list">
                  {village.constructionQueue.map((building) => {
                    const def = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
                    return (
                      <div key={building.id} className="cheat-building-item">
                        <span>{def?.icon} {def?.name}</span>
                        <button onClick={() => cheatCompleteBuilding(building.id)}>Complete</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="cheat-warning">
            ⚠️ REMOVE THIS MENU BEFORE PRODUCTION ⚠️
          </div>
        </div>
      </div>
    </div>
  )
}

