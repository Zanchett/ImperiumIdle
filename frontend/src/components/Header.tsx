import './Header.css'
import { authService } from '../services/authService'
import { useGameStore } from '../stores/gameStore'

interface HeaderProps {
  gold: number
  resources: Record<string, number>
  playerName: string
  onToggleSkillTree: () => void
  skillTreeOpen: boolean
}

export default function Header({ gold, resources, playerName, onToggleSkillTree, skillTreeOpen }: HeaderProps) {
  const { logout, setInventoryOpen } = useGameStore()

  const handleLogout = () => {
    authService.removeAuthToken()
    logout()
  }

  const totalResources = Object.values(resources).reduce((sum, amount) => sum + amount, 0)

  return (
    <header className="dataslate-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-text">IMPERIUM</span>
          <span className="logo-subtitle">IDLE PROTOCOL</span>
        </div>
      </div>
      <div className="header-center">
        <div className="header-resources">
          <div className="header-resource-item">
            <span className="header-resource-icon">💰</span>
            <span className="header-resource-label">THRONE GELT</span>
            <span className="header-resource-value">{gold.toLocaleString()}</span>
          </div>
          <button 
            className="inventory-button"
            onClick={() => setInventoryOpen(true)}
            title="Open Inventory"
          >
            <span className="inventory-icon">
              <img src="/images/icons/inventory.png" alt="Inventory" />
            </span>
            <span className="inventory-label">INVENTORY</span>
            {totalResources > 0 && (
              <span className="inventory-count">{totalResources}</span>
            )}
          </button>
          <button 
            className={`skill-tree-button ${skillTreeOpen ? 'active' : ''}`}
            onClick={onToggleSkillTree}
            title="Toggle Skill Tree"
          >
            <span className="skill-tree-icon">
              <img src="/images/icons/skill_tree.png" alt="Skill Tree" />
            </span>
            <span className="skill-tree-label">SKILL TREE</span>
          </button>
        </div>
      </div>
      <div className="header-right">
        <div className="player-info">
          <span className="player-name">{playerName || 'GUARDSMAN'}</span>
          <span className="status-indicator">●</span>
          <button className="logout-button" onClick={handleLogout} title="Logout">
            ⚡
          </button>
        </div>
      </div>
    </header>
  )
}

