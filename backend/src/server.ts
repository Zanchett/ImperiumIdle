import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { User } from './models/User.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imperiumidle'

// Middleware
app.use(cors())
app.use(express.json())

// Routes
import authRoutes from './routes/auth.js'
app.use('/api/auth', authRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ImperiumIdle Backend is running' })
})

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
    console.log('⚠️  Continuing without database...')
  })

// Socket.io connection handling with authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1]
    
    if (!token) {
      // Allow connection but mark as unauthenticated
      socket.data.authenticated = false
      return next()
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const user = await User.findById(decoded.userId).select('username email')
    if (user) {
      socket.data.userId = decoded.userId
      socket.data.username = user.username
      socket.data.authenticated = true
    } else {
      socket.data.authenticated = false
    }
    
    next()
  } catch (error) {
    socket.data.authenticated = false
    next()
  }
})

io.on('connection', (socket) => {
  if (socket.data.authenticated) {
    console.log(`✅ Authenticated user connected: ${socket.data.username} (${socket.id})`)
  } else {
    console.log(`⚠️  Unauthenticated connection: ${socket.id}`)
  }

  // Handle authentication after connection
  socket.on('authenticate', async ({ token }) => {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      
      const user = await User.findById(decoded.userId).select('username email')
      if (user) {
        socket.data.userId = decoded.userId
        socket.data.username = user.username
        socket.data.authenticated = true
        socket.emit('authenticated', { username: user.username })
        console.log(`✅ User authenticated: ${user.username}`)
      }
    } catch (error) {
      socket.emit('auth_error', { error: 'Invalid token' })
    }
  })

  socket.on('disconnect', () => {
    if (socket.data.authenticated) {
      console.log(`👋 User disconnected: ${socket.data.username} (${socket.id})`)
    } else {
      console.log(`👋 Connection closed: ${socket.id}`)
    }
  })

  // Echo test
  socket.on('ping', () => {
    socket.emit('pong')
  })

  // Chat message (only for authenticated users)
  socket.on('chat:message', (data) => {
    if (!socket.data.authenticated) {
      return socket.emit('error', { message: 'Authentication required' })
    }

    console.log(`💬 Chat from ${socket.data.username}:`, data.message)
    // Broadcast to all clients
    io.emit('chat:message', {
      userId: socket.data.userId,
      username: socket.data.username,
      message: data.message,
      timestamp: new Date().toISOString(),
    })
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Socket.io ready for connections`)
})

