import { useEffect, useState } from 'react'
import './App.css'
import { useGameStore } from './stores/gameStore'
import { socketService } from './services/socketService'
import { authService } from './services/authService'
import { Skill } from './types/skills'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import LoginScreen from './components/LoginScreen'
import Inventory from './components/Inventory'
import BackgroundGathering from './components/BackgroundGathering'
import BackgroundEngineering from './components/BackgroundEngineering'
import NotificationToast from './components/NotificationToast'
import CheatMenu from './components/CheatMenu' // CHEAT MENU - REMOVE BEFORE PRODUCTION
import { SkillTree } from './components/SkillTree'

function App() {
  const {
    authenticated,
    user,
    connected,
    selectedSkill,
    skillCategories,
    gold,
    resources,
    inventoryOpen,
    setUser,
    setAuthenticated,
    setConnected,
    connect,
    disconnect,
    selectSkill,
    toggleCategory,
    setInventoryOpen,
  } = useGameStore()

  const handleSelectSkill = (skill: Skill) => {
    selectSkill(skill)
    // Close inventory when selecting a skill
    if (inventoryOpen) {
      setInventoryOpen(false)
    }
  }

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [skillTreeOpen, setSkillTreeOpen] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          } else {
            authService.removeAuthToken()
            setAuthenticated(false)
          }
        } catch (error) {
          authService.removeAuthToken()
          setAuthenticated(false)
        }
      }
      setCheckingAuth(false)
    }

    checkAuth()
  }, [setUser, setAuthenticated])

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (authenticated && user) {
      socketService.connect()
      
      // Update socket with auth token
      const token = localStorage.getItem('token')
      if (token) {
        socketService.emit('authenticate', { token })
      }

      socketService.on('connect', () => {
        setConnected(true)
        connect()
      })

      socketService.on('disconnect', () => {
        setConnected(false)
        disconnect()
      })

      return () => {
        socketService.disconnect()
      }
    }
  }, [authenticated, user, setConnected, connect, disconnect])

  // Auto-select first skill if none selected
  useEffect(() => {
    if (authenticated && !selectedSkill && skillCategories.length > 0) {
      const firstCategory = skillCategories.find((cat) => !cat.collapsed && cat.skills.length > 0) 
        || skillCategories.find((cat) => cat.skills.length > 0)
      if (firstCategory && firstCategory.skills.length > 0) {
        selectSkill(firstCategory.skills[0])
      }
    }
  }, [authenticated, selectedSkill, skillCategories, selectSkill])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="app dataslate">
        <div className="loading-screen">
          <div className="loading-message">
            <span className="loading-icon">⏳</span>
            <span>INITIALIZING SYSTEM...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

  // Show main game if authenticated
  return (
    <div className="app dataslate">
      {authenticated && <BackgroundGathering />}
      {authenticated && <BackgroundEngineering />}
      <NotificationToast />
      {authenticated && <CheatMenu />} {/* CHEAT MENU - REMOVE BEFORE PRODUCTION */}
      <Header
        gold={gold}
        resources={resources}
        playerName={user?.username || 'GUARDSMAN'}
        onToggleSkillTree={() => {
          setSkillTreeOpen(!skillTreeOpen)
        }}
        skillTreeOpen={skillTreeOpen}
      />
      <div className="app-layout">
        {skillTreeOpen ? (
          <SkillTree />
        ) : (
          <>
            <Sidebar
              categories={skillCategories}
              selectedSkill={selectedSkill}
              onSelectSkill={handleSelectSkill}
              onToggleCategory={toggleCategory}
            />
            {inventoryOpen ? (
              <Inventory />
            ) : (
              <MainContent skill={selectedSkill} />
            )}
          </>
        )}
      </div>
      {!connected && authenticated && (
        <div className="connection-overlay">
          <div className="connection-message">
            <div className="connection-icon">⚠</div>
            <h2>NO CONNECTION TO SERVER</h2>
            <p>Attempting to establish link...</p>
            <div className="connection-status">
              Status: <span className="status-offline">OFFLINE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
