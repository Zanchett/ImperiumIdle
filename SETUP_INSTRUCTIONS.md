# Detailed Setup Instructions for Windows (Fresh Install)

This guide will walk you through installing everything needed to develop ImperiumIdle from scratch on a fresh Windows installation.

## Part 1: Installing Required Software

### 1.1 Install Node.js (CRITICAL - DO THIS FIRST)

**Why**: Node.js includes npm (Node Package Manager) which is required to install and run all project dependencies.

**Steps**:
1. Open your web browser
2. Go to: **https://nodejs.org/**
3. You'll see two download buttons:
   - **LTS** (Long Term Support) - Download this one (Recommended)
   - **Current** - Don't download this unless you know what you're doing
4. Click the **LTS** button (it should say something like "v20.x.x LTS")
5. The installer (.msi file) will download
6. Run the installer (double-click the downloaded file)
7. In the installer:
   - ✅ Check "Automatically install the necessary tools"
   - Click "Next" through all screens (defaults are fine)
   - Click "Install" when prompted
   - Wait for installation to complete
   - Click "Finish"

**Verify Installation**:
1. Press `Windows Key + X` and select "Windows PowerShell" (or search for PowerShell)
2. Type: `node --version`
   - You should see something like: `v20.10.0` or similar
3. Type: `npm --version`
   - You should see something like: `10.2.3` or similar
4. If both commands work, ✅ Node.js is installed correctly!

---

### 1.2 Install Git (Recommended but Optional)

**Why**: Git allows you to track changes, create backups, and collaborate on code.

**Steps**:
1. Go to: **https://git-scm.com/download/win**
2. The website should automatically detect Windows and show a download button
3. Click "Download" for the latest version
4. Run the installer
5. Keep clicking "Next" (all defaults are fine for beginners)
6. Click "Install"
7. Click "Finish"

**Verify Installation**:
1. Open PowerShell
2. Type: `git --version`
   - You should see something like: `git version 2.43.0`

---

### 1.3 Install Visual Studio Code (Recommended Editor)

**Why**: VS Code is a powerful, free code editor that works great with TypeScript, React, and Node.js.

**Steps**:
1. Go to: **https://code.visualstudio.com/**
2. Click the big blue "Download for Windows" button
3. Run the installer
4. During installation:
   - ✅ Check "Add to PATH"
   - ✅ Check "Register Code as an editor for supported file types"
   - Click "Next" → "Next" → "Install"
5. Launch VS Code after installation

**Install VS Code Extensions** (After VS Code opens):
1. Click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for and install these extensions:
   - **ESLint** (by Microsoft)
   - **Prettier** (by Prettier)
   - **TypeScript and JavaScript Language Features** (usually pre-installed)

---

### 1.4 Install MongoDB (Database - Choose ONE Option)

You have two options: Local installation or Cloud (recommended for beginners).

#### Option A: MongoDB Atlas (Cloud - EASIER, Recommended for Beginners)

**Why**: Free cloud database, no local setup, works immediately.

**Steps**:
1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Create a free account (use email)
3. Choose the **FREE** tier (M0 Sandbox)
4. Choose a cloud provider (AWS is fine, pick closest region)
5. Create a username and password (SAVE THESE!)
6. In "Network Access", click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
7. In "Database Access", your user should already be created
8. Click "Create Cluster" and wait 3-5 minutes
9. After cluster is created:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password
   - Save this string - you'll need it later!

**✅ Done!** You'll use this connection string in the `.env` file.

#### Option B: MongoDB Community Server (Local Installation)

**Why**: Full control, works offline, but requires more setup.

**Steps**:
1. Go to: **https://www.mongodb.com/try/download/community**
2. Select:
   - Version: Latest (7.0.x recommended)
   - Platform: Windows
   - Package: MSI
3. Click "Download"
4. Run the installer
5. In the installer:
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Windows Service"
   - ✅ Check "Run service as Network Service user"
   - ✅ Check "Install MongoDB Compass" (helpful GUI tool)
   - Click "Install"
6. Wait for installation to complete

**Verify Installation**:
1. Open PowerShell as Administrator
2. Type: `Get-Service MongoDB`
   - Should show status as "Running"
3. If not running, type: `Start-Service MongoDB`

**✅ Done!** Connection string will be: `mongodb://localhost:27017/imperiumidle`

---

## Part 2: Setting Up the Project

### 2.1 Navigate to Project Directory

1. Open PowerShell
2. Type (replace with your actual path if different):
   ```powershell
   cd C:\Users\gabri\Projects\ImperiumIdle
   ```

### 2.2 Install All Dependencies

This will take 5-10 minutes depending on your internet speed.

**Option 1: Use the convenience script (EASIEST)**:
```powershell
npm run install:all
```

**Option 2: Install manually**:
```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install electron dependencies
cd electron
npm install
cd ..
```

**What's happening**: npm is downloading all the libraries and tools your project needs.

**⚠️ If you see errors**:
- Make sure Node.js is installed (`node --version`)
- Try deleting `node_modules` folders and running again
- Check your internet connection

---

### 2.3 Create Environment Configuration Files

1. In the `backend` folder, you'll see a file named `env.example.txt`
2. Copy this file and rename it to `.env` (remove `.txt`, add dot at start)
   - Or manually create a new file named `.env` and copy the contents
3. Edit the `.env` file:

   **If using MongoDB Atlas (Cloud)**:
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/imperiumidle?retryWrites=true&w=majority
   ```
   (Use the connection string you saved from Step 1.4 Option A)

   **If using Local MongoDB**:
   ```
   MONGODB_URI=mongodb://localhost:27017/imperiumidle
   ```

4. Save the file

---

## Part 3: Running the Development Environment

### 3.1 Start the Backend Server

1. Open PowerShell
2. Navigate to backend:
   ```powershell
   cd C:\Users\gabri\Projects\ImperiumIdle\backend
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```
4. You should see:
   ```
   🚀 Server running on http://localhost:5000
   📡 Socket.io ready for connections
   ```
5. **Keep this window open!** The server needs to keep running.

---

### 3.2 Start the Frontend (In a NEW PowerShell Window)

1. Open a **NEW** PowerShell window (don't close the backend one!)
2. Navigate to frontend:
   ```powershell
   cd C:\Users\gabri\Projects\ImperiumIdle\frontend
   ```
3. Start the frontend:
   ```powershell
   npm run dev
   ```
4. You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:3000/
   ```
5. **Keep this window open too!**

---

### 3.3 Open the Game in Browser

1. Open your web browser
2. Go to: **http://localhost:3000**
3. You should see the ImperiumIdle game interface!

**If you see errors**:
- Make sure both backend and frontend are running
- Check that ports 3000 and 5000 aren't being used by other programs
- Check the console in PowerShell for error messages

---

### 3.4 (Optional) Run Electron Desktop App

1. Open a **THIRD** PowerShell window
2. Navigate to electron:
   ```powershell
   cd C:\Users\gabri\Projects\ImperiumIdle\electron
   ```
3. Start Electron:
   ```powershell
   npm run dev
   ```
4. A desktop window should open with the game!

---

## Part 4: Building the .exe File

When you're ready to create an executable:

1. Make sure the frontend is built:
   ```powershell
   cd frontend
   npm run build
   cd ..
   ```

2. Build the Electron app:
   ```powershell
   cd electron
   npm run build:win
   ```

3. Find your `.exe` in: `electron/dist/`

---

## Troubleshooting Common Issues

### "npm is not recognized"
- **Problem**: Node.js not installed or not in PATH
- **Solution**: Reinstall Node.js, make sure to check "Add to PATH" option

### "Port 3000/5000 already in use"
- **Problem**: Another program is using these ports
- **Solution**: 
  ```powershell
  # Find what's using port 5000
  netstat -ano | findstr :5000
  # Kill the process (replace PID with the number shown)
  taskkill /PID <PID> /F
  ```

### "Cannot connect to MongoDB"
- **Problem**: Database connection issue
- **Solution**: 
  - Check your `.env` file has the correct connection string
  - For Atlas: Make sure your IP is whitelisted
  - For local: Make sure MongoDB service is running

### "Module not found" errors
- **Problem**: Dependencies not installed
- **Solution**: 
  ```powershell
  # Delete node_modules and reinstall
  Remove-Item -Recurse -Force node_modules
  npm install
  ```

---

## Next Steps After Setup

1. ✅ Verify everything is running
2. ✅ Test the connection between frontend and backend
3. Start coding your game features!
4. Read the code structure in each folder's README

---

## Quick Command Reference

```powershell
# Install everything
npm run install:all

# Run backend (Terminal 1)
cd backend && npm run dev

# Run frontend (Terminal 2)
cd frontend && npm run dev

# Run Electron (Terminal 3, optional)
cd electron && npm run dev

# Build for production
cd frontend && npm run build
cd electron && npm run build:win
```

---

**Congratulations!** 🎉 You now have a complete development environment set up!

