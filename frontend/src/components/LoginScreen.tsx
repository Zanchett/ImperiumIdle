import { useState } from 'react'
import './LoginScreen.css'
import { authService, RegisterData, LoginData } from '../services/authService'

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<RegisterData & LoginData>({
    username: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isRegister) {
        response = await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      } else {
        response = await authService.login({
          username: formData.username,
          password: formData.password,
        })
      }

      onLoginSuccess(response.user)
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'An error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-main">IMPERIUM</span>
            <span className="logo-subtitle">IDLE PROTOCOL</span>
          </div>
          <div className="login-divider"></div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">IDENTIFICATION</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">VOCAL LINK ADDRESS</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ACCESS CODE</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
            />
          </div>

          {error && (
            <div className="form-error">
              <span className="error-icon">⚠</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="form-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">PROCESSING...</span>
            ) : (
              <span>{isRegister ? 'ESTABLISH CONNECTION' : 'AUTHENTICATE'}</span>
            )}
          </button>
        </form>

        <div className="login-footer">
          <button
            className="toggle-mode"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
              setFormData({ username: '', email: '', password: '' })
            }}
          >
            {isRegister ? (
              <>
                <span>EXISTING USER?</span>
                <span className="toggle-link">AUTHENTICATE</span>
              </>
            ) : (
              <>
                <span>NEW RECRUIT?</span>
                <span className="toggle-link">ESTABLISH CONNECTION</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

