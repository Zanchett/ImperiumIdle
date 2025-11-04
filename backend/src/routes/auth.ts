import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      })
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      gameData: {
        gold: 0,
        resources: {},
        skills: {},
      },
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id.toString())

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameData: user.gameData,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Server error during registration' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user._id.toString())

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameData: user.gameData,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
})

// Get current user (protected route)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = (req.user as any)?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameData: user.gameData,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

