# ImperiumIdle Architecture & Multiplayer Design

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (React + TS)   │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP + WebSocket
         │
┌────────▼────────┐
│    Backend      │
│ (Node.js + TS)  │
│   Port: 5000    │
└────────┬────────┘
         │
┌────────▼────────┐
│    MongoDB      │
│   (Database)    │
└─────────────────┘
```

## Tech Stack Justification

### Frontend: React + TypeScript + Vite
- **React**: Component-based UI, excellent for game interfaces
- **TypeScript**: Type safety, reduces bugs
- **Vite**: Fast development server, quick hot-reload
- **Zustand**: Lightweight state management for game state
- **Socket.io-client**: Real-time communication

### Backend: Node.js + Express + Socket.io
- **Node.js**: JavaScript everywhere, easy to maintain
- **Express**: REST API for HTTP requests
- **Socket.io**: WebSocket library for real-time multiplayer
- **MongoDB**: Flexible schema, good for game data

### Desktop: Electron
- **Electron**: Package web app as native .exe
- **electron-builder**: Create installers for Windows/Steam

## Multiplayer Architecture

### Real-time Communication

**Socket.io Events Structure:**

```
Client → Server:
  - connect: User joins
  - disconnect: User leaves
  - chat:message: Send chat message
  - game:action: Game actions (attack, trade, etc.)
  - player:update: Update player state
  - base:attack: Initiate base invasion

Server → Client:
  - connect: Confirm connection
  - chat:message: Broadcast chat
  - game:state: Game world updates
  - player:joined: New player notification
  - player:left: Player disconnect
  - base:invasion: Base invasion alert
  - pvp:challenge: PvP challenge received
```

### Database Schema (MongoDB)

**Players Collection:**
```javascript
{
  _id: ObjectId,
  username: string,
  email: string,
  passwordHash: string,
  stats: {
    level: number,
    experience: number,
    gold: number,
    resources: {...}
  },
  base: {
    level: number,
    defenses: [...],
    location: {x, y}
  },
  inventory: [...],
  lastLogin: Date
}
```

**Trades Collection:**
```javascript
{
  _id: ObjectId,
  fromPlayer: ObjectId,
  toPlayer: ObjectId,
  items: [...],
  gold: number,
  status: 'pending' | 'accepted' | 'rejected',
  createdAt: Date
}
```

**Base Invasions Collection:**
```javascript
{
  _id: ObjectId,
  attackerId: ObjectId,
  defenderId: ObjectId,
  baseId: ObjectId,
  status: 'in-progress' | 'completed' | 'failed',
  startTime: Date,
  endTime: Date,
  result: {...}
}
```

## Testing Multiplayer Locally

### Method 1: Multiple Browser Tabs
1. Run backend server
2. Open `http://localhost:3000` in multiple browser tabs
3. Each tab is a separate client
4. Test chat, trading, etc.

### Method 2: Multiple Electron Windows
1. Run Electron app multiple times
2. Each instance is a separate client
3. Test full desktop experience

### Method 3: Network Testing (Multiple Computers)
1. Find your local IP: `ipconfig` (look for IPv4)
2. Start backend: Set `FRONTEND_URL` to your IP
3. On other computers: Connect to `http://YOUR_IP:3000`
4. Test multiplayer across network

## Pre-Steam Deployment Options

### Option 1: Cloud Hosting (Recommended)
**Services:**
- **Railway.app**: Easy deployment, free tier
- **Render.com**: Free tier, auto-deploy
- **Heroku**: Paid but reliable
- **AWS/Google Cloud**: More control, more setup

**Steps:**
1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables
4. Deploy
5. Share URL with testers

### Option 2: VPS (Virtual Private Server)
**Providers:**
- DigitalOcean ($5/month)
- Linode ($5/month)
- AWS EC2 (pay-as-you-go)

**Steps:**
1. Create VPS instance
2. Install Node.js, MongoDB
3. Clone repository
4. Configure firewall
5. Run with PM2 (process manager)

### Option 3: Temporary Test Server
- Use ngrok to expose local server: `ngrok http 5000`
- Share ngrok URL with testers
- **Note**: Only works when your computer is on

## Steam Integration (Future)

### Steamworks SDK Integration
- Steam authentication
- Achievements
- Leaderboards
- Workshop support
- Trading cards

### Distribution
- Electron app wraps Steamworks SDK
- Steam handles updates via Steam Client
- Can still use web backend for multiplayer

## Security Considerations

### Authentication
- JWT tokens for session management
- Password hashing with bcrypt
- Rate limiting on API endpoints

### Multiplayer Security
- Validate all actions server-side
- Prevent cheating with server authority
- Rate limit chat/trades
- Sanitize user input

### Database Security
- Use connection strings (not hardcoded)
- Regular backups
- Index optimization for performance

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading components
- Optimize images/assets
- Minimize bundle size

### Backend
- Database indexing
- Connection pooling
- Caching frequently accessed data
- Load balancing for scale

### Socket.io
- Room-based messaging (only send to relevant players)
- Compression for large payloads
- Heartbeat optimization

## Development Workflow

1. **Local Development**: Run all services locally
2. **Testing**: Use multiple clients locally
3. **Staging**: Deploy to cloud for testing
4. **Production**: Deploy final version
5. **Steam**: Package Electron app with Steam SDK

## Next Steps

1. ✅ Basic structure complete
2. ⏭️ Implement authentication
3. ⏭️ Add game mechanics (idle progression)
4. ⏭️ Implement chat system
5. ⏭️ Add trading system
6. ⏭️ Add base invasions
7. ⏭️ Add PvP system
8. ⏭️ Steam integration

