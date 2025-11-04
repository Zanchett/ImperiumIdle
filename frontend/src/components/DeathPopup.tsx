import './DeathPopup.css'

interface DeathPopupProps {
  mainSkillXPLost: number
  subSkillXPLost: number
  subSkillName: string
  onResume: () => void
}

export default function DeathPopup({ mainSkillXPLost, subSkillXPLost, subSkillName, onResume }: DeathPopupProps) {
  return (
    <div className="death-popup-overlay">
      <div className="death-popup">
        <h2 className="death-popup-title">You Died!</h2>
        <div className="death-popup-content">
          <p className="death-popup-message">You have been defeated in combat.</p>
          <div className="death-popup-xp-loss">
            <p className="xp-loss-item">
              <span className="xp-loss-label">Main Skill XP Lost:</span>
              <span className="xp-loss-value">-{mainSkillXPLost.toLocaleString()}</span>
            </p>
            <p className="xp-loss-item">
              <span className="xp-loss-label">{subSkillName} XP Lost:</span>
              <span className="xp-loss-value">-{subSkillXPLost.toLocaleString()}</span>
            </p>
          </div>
          <button className="death-popup-resume-button" onClick={onResume}>
            Resume
          </button>
        </div>
      </div>
    </div>
  )
}

