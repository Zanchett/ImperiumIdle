# Quick Start Guide

## TL;DR - Get Running Fast

After completing the full setup (see `SETUP_INSTRUCTIONS.md`), follow these steps:

### 1. Install Dependencies (First Time Only)
```powershell
npm run install:all
```

### 2. Create Backend .env File
1. Copy `backend/env.example.txt` to `backend/.env`
2. Edit `backend/.env` with your MongoDB connection string

### 3. Start Development

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 3 - Electron (Optional):**
```powershell
cd electron
npm run dev
```

### 4. Open Game
- Browser: http://localhost:3000
- Or use the Electron window

## Testing Multiplayer Locally

1. Start backend (Terminal 1)
2. Start frontend (Terminal 2)
3. Open http://localhost:3000 in multiple browser tabs
4. Each tab is a separate player - test chat, trading, etc.

## Building .exe

```powershell
cd frontend
npm run build
cd ../electron
npm run build:win
```

Find `.exe` in `electron/dist/`

## Need Help?

- Full setup: See `SETUP_INSTRUCTIONS.md`
- Architecture: See `ARCHITECTURE.md`
- Main docs: See `README.md`

