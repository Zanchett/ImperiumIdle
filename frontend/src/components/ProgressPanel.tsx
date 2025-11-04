import { Skill } from '../types/skills'
import './ProgressPanel.css'

interface ProgressPanelProps {
  skill: Skill | null
}

export default function ProgressPanel({ skill }: ProgressPanelProps) {
  if (!skill) {
    return (
      <aside className="progress-panel">
        <div className="empty-progress">
          <p>No skill selected</p>
        </div>
      </aside>
    )
  }

  const experiencePercent = (skill.experience / skill.experienceToNext) * 100
  const masteryPercent = skill.mastery

  return (
    <aside className="progress-panel">
      <div className="panel-section">
        <h3 className="panel-title">LEVEL PROGRESS</h3>
        <div className="progress-info">
          <div className="level-display">
            <span className="level-label">LEVEL</span>
            <span className="level-value">{skill.level}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${experiencePercent}%` }}
              ></div>
              <div className="progress-text">
                {skill.experience.toLocaleString()} / {skill.experienceToNext.toLocaleString()} XP
              </div>
            </div>
          </div>
          <div className="progress-percent">{experiencePercent.toFixed(1)}%</div>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-title">MASTERY</h3>
        <div className="progress-info">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill mastery"
                style={{ width: `${masteryPercent}%` }}
              ></div>
              <div className="progress-text">{masteryPercent.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-links">
          <button className="panel-link">
            <span className="link-icon">🏆</span>
            <span className="link-text">MILESTONES</span>
          </button>
          <button className="panel-link">
            <span className="link-icon">⭐</span>
            <span className="link-text">MASTERY UNLOCKS</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

