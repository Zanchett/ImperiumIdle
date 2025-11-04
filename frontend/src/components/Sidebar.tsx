import { Skill, SkillCategoryData } from '../types/skills'
import { useGameStore } from '../stores/gameStore'
import './Sidebar.css'

interface SidebarProps {
  categories: SkillCategoryData[]
  selectedSkill: Skill | null
  onSelectSkill: (skill: Skill) => void
  onToggleCategory: (categoryName: string) => void
}

export default function Sidebar({
  categories,
  selectedSkill,
  onSelectSkill,
  onToggleCategory,
}: SidebarProps) {
  const { combatSubStats } = useGameStore()
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">PROTOCOL SELECTION</span>
      </div>
      <nav className="sidebar-nav">
        {categories.map((category) => (
          <div key={category.name} className="category-group">
            <button
              className="category-header"
              onClick={() => onToggleCategory(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-arrow">
                {category.collapsed ? '▼' : '▲'}
              </span>
            </button>
            {!category.collapsed && (
              <ul className="skill-list">
                {category.skills.map((skill) => {
                  const isSelected = selectedSkill?.id === skill.id
                  const xpPercent = (skill.experience / skill.experienceToNext) * 100
                  const nextLevelXP = skill.experienceToNext
                  const isCombatSkill = skill.id === 'melee-combat' || skill.id === 'bolter-training'
                  const showSubStats = isSelected && isCombatSkill
                  
                  return (
                    <li key={skill.id}>
                      <button
                        className={`skill-item ${
                          isSelected ? 'active' : ''
                        }`}
                        onClick={() => onSelectSkill(skill)}
                      >
                        <div className="skill-content-wrapper">
                          <div className="skill-name-row">
                            <span className="skill-icon">{skill.icon}</span>
                            <span className="skill-name">{skill.name}</span>
                            <span className="skill-level">Lv.{skill.level}</span>
                          </div>
                          <div className="skill-xp-info">
                            <span className="xp-text">
                              XP: {skill.experience.toLocaleString()} / {nextLevelXP.toLocaleString()} (Next: +{nextLevelXP})
                            </span>
                          </div>
                          <div className="skill-xp-bar">
                            <div
                              className="skill-xp-progress"
                              style={{ width: `${Math.min(xpPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </button>
                      {showSubStats && (
                        <ul className="sub-stat-list">
                          {skill.id === 'melee-combat' && (
                            <>
                              <li className="sub-stat-item">
                                <div className="sub-stat-content-wrapper">
                                  <div className="sub-stat-name-row">
                                    <span className="sub-stat-icon">💪</span>
                                    <span className="sub-stat-name">Strength</span>
                                    <span className="sub-stat-level">Lv.{combatSubStats.strength.level}</span>
                                  </div>
                                  <div className="sub-stat-xp-info">
                                    <span className="sub-stat-xp-text">
                                      XP: {combatSubStats.strength.experience.toLocaleString()} / {combatSubStats.strength.experienceToNext.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="sub-stat-xp-bar">
                                    <div
                                      className="sub-stat-xp-progress"
                                      style={{ width: `${Math.min((combatSubStats.strength.experience / combatSubStats.strength.experienceToNext) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </li>
                              <li className="sub-stat-item">
                                <div className="sub-stat-content-wrapper">
                                  <div className="sub-stat-name-row">
                                    <span className="sub-stat-icon">⚔️</span>
                                    <span className="sub-stat-name">Attack</span>
                                    <span className="sub-stat-level">Lv.{combatSubStats.attack.level}</span>
                                  </div>
                                  <div className="sub-stat-xp-info">
                                    <span className="sub-stat-xp-text">
                                      XP: {combatSubStats.attack.experience.toLocaleString()} / {combatSubStats.attack.experienceToNext.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="sub-stat-xp-bar">
                                    <div
                                      className="sub-stat-xp-progress"
                                      style={{ width: `${Math.min((combatSubStats.attack.experience / combatSubStats.attack.experienceToNext) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </li>
                              <li className="sub-stat-item">
                                <div className="sub-stat-content-wrapper">
                                  <div className="sub-stat-name-row">
                                    <span className="sub-stat-icon">🛡️</span>
                                    <span className="sub-stat-name">Defence</span>
                                    <span className="sub-stat-level">Lv.{combatSubStats.defence.level}</span>
                                  </div>
                                  <div className="sub-stat-xp-info">
                                    <span className="sub-stat-xp-text">
                                      XP: {combatSubStats.defence.experience.toLocaleString()} / {combatSubStats.defence.experienceToNext.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="sub-stat-xp-bar">
                                    <div
                                      className="sub-stat-xp-progress"
                                      style={{ width: `${Math.min((combatSubStats.defence.experience / combatSubStats.defence.experienceToNext) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </li>
                              <li className="sub-stat-item">
                                <div className="sub-stat-content-wrapper">
                                  <div className="sub-stat-name-row">
                                    <span className="sub-stat-icon">⚡</span>
                                    <span className="sub-stat-name">Agility</span>
                                    <span className="sub-stat-level">Lv.{combatSubStats.agility.level}</span>
                                  </div>
                                  <div className="sub-stat-xp-info">
                                    <span className="sub-stat-xp-text">
                                      XP: {combatSubStats.agility.experience.toLocaleString()} / {combatSubStats.agility.experienceToNext.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="sub-stat-xp-bar">
                                    <div
                                      className="sub-stat-xp-progress"
                                      style={{ width: `${Math.min((combatSubStats.agility.experience / combatSubStats.agility.experienceToNext) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </li>
                            </>
                          )}
                          {skill.id === 'bolter-training' && (
                            <li className="sub-stat-item">
                              <div className="sub-stat-content-wrapper">
                                <div className="sub-stat-name-row">
                                  <span className="sub-stat-icon">📊</span>
                                  <span className="sub-stat-name">Ranged Sub-Stats</span>
                                  <span className="sub-stat-level">Coming Soon</span>
                                </div>
                              </div>
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
