import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    username: string
    email: string
    gameData: any
  }
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginData {
  username: string
  password: string
}

class AuthService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('token', token)
  }

  removeAuthToken(): void {
    localStorage.removeItem('token')
  }

  getAuthHeaders() {
    const token = this.getAuthToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data)
    if (response.data.token) {
      this.setAuthToken(response.data.token)
    }
    return response.data
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data)
    if (response.data.token) {
      this.setAuthToken(response.data.token)
    }
    return response.data
  }

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const token = this.getAuthToken()
      if (!token) return null

      const response = await axios.get<{ user: AuthResponse['user'] }>(
        `${API_URL}/auth/me`,
        { headers: this.getAuthHeaders() }
      )
      return response.data.user
    } catch (error) {
      this.removeAuthToken()
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}

export const authService = new AuthService()

