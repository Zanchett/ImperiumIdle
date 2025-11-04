import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../models/User.js'

export interface AuthRequest extends Request {
  user?: IUser
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.user = { userId: decoded.userId } as any
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' })
  }
}

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      req.user = decoded as any
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }
  next()
}

