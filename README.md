# ImperiumIdle - Multiplayer Idle Game

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express + Socket.io (for real-time multiplayer)
- **Desktop**: Electron (for .exe distribution)
- **Build Tool**: Vite (fast development and building)
- **Database**: MongoDB (or PostgreSQL - can be configured later)

## Prerequisites Installation 

### Step 1: Install Node.js (Required)
1. Go to https://nodejs.org/
2. Download the **LTS version** (Recommended for most users)
3. Run the installer (.msi file)
4. During installation:
   - Check "Automatically install the necessary tools"
   - Accept all default options
5. Verify installation:
   - Open PowerShell
   - Run: `node --version` (should show v20.x.x or similar)
   - Run: `npm --version` (should show 10.x.x or similar)

### Step 2: Install Git (Recommended for Version Control)
1. Go to https://git-scm.com/download/win
2. Download the Windows installer
3. Run the installer with default settings
4. Verify: `git --version`

### Step 3: Install Visual Studio Code (Recommended Editor)
1. Go to https://code.visualstudio.com/
2. Download and install
3. Recommended extensions (install after setup):
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - React snippets

### Step 4: Install MongoDB (For Database - Optional for now)
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Run installer
4. Choose "Complete" installation
5. Install as Windows Service (recommended)
6. Verify: MongoDB should be running in Services

**Alternative**: You can use MongoDB Atlas (cloud) for free instead of local installation.

## Project Setup

### 1. Clone/Navigate to Project Directory
```powershell
cd C:\...\ImperiumIdle
```

### 2. Install Dependencies
```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install electron dependencies
cd ../electron
npm install

# Return to root
cd ..
```

### 3. Environment Setup

Create `.env` files:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration (if needed)

See `backend/.env.example` for required variables.

### 4. Database Setup

If using local MongoDB:
- MongoDB should already be running (from Step 4 above)
- Connection string: `mongodb://localhost:27017/imperiumidle`

If using MongoDB Atlas:
- Create account at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and add to `backend/.env`

### 5. Development Mode

#### Start Backend Server:
```powershell
cd backend
npm run dev
```

#### Start Frontend (in new terminal):
```powershell
cd frontend
npm run dev
```

#### Start Electron App (in new terminal):
```powershell
cd electron
npm run dev
```

### 6. Building for Production

#### Build Frontend:
```powershell
cd frontend
npm run build
```

#### Build Electron Executable:
```powershell
cd electron
npm run build
```

The `.exe` will be in `electron/dist/`

## Multiplayer Testing

For local multiplayer testing:
1. Run the backend server
2. Connect multiple clients (browser tabs or Electron windows)
3. Use different user accounts to test interactions

For remote testing (before Steam):
- Deploy backend to a cloud service (Heroku, Railway, AWS, etc.)
- Update frontend connection URL
- Test with friends

## Steam Integration (Future)

- Steam SDK will be integrated later
- Authentication via Steam
- Workshop support can be added
- Achievements integration

## Project Structure

```
ImperiumIdle/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js + Express + Socket.io backend
├── electron/          # Electron wrapper
├── shared/            # Shared types and utilities
└── README.md
```

## Development Tips

1. Always run backend before frontend/electron
2. Check console for connection errors
3. Use browser dev tools for debugging
4. MongoDB Compass (GUI) is helpful for database inspection

## Next Steps

1. Complete installation steps above
2. Run `npm install` in root directory
3. Start with backend development
4. Add game logic progressively
5. Implement multiplayer features incrementally

