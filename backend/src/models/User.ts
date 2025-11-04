import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends mongoose.Document {
  username: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  gameData: {
    gold: number
    resources: Record<string, number>
    skills: Record<string, {
      level: number
      experience: number
      experienceToNext: number
      mastery: number
    }>
  }
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gameData: {
      gold: {
        type: Number,
        default: 0,
      },
      resources: {
        type: Map,
        of: Number,
        default: {},
      },
      skills: {
        type: Map,
        of: {
          level: { type: Number, default: 1 },
          experience: { type: Number, default: 0 },
          experienceToNext: { type: Number, default: 100 },
          mastery: { type: Number, default: 0 },
        },
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export const User = mongoose.model<IUser>('User', userSchema)

