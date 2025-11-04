import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false

  connect() {
    if (this.socket?.connected) {
      return
    }

    const token = localStorage.getItem('token')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
      
      // Send token if available
      if (token) {
        this.emit('authenticate', { token })
      }
    })

    this.socket.on('authenticated', (data: any) => {
      console.log('Authenticated:', data)
    })

    this.socket.on('auth_error', (error: any) => {
      console.error('Authentication error:', error)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  getSocket() {
    return this.socket
  }

  getConnected() {
    return this.isConnected && this.socket?.connected
  }
}

export const socketService = new SocketService()

