# Tarteeb Deployment Guide

Your app works as **both web and desktop** versions, sharing the same Firebase database!

## 🌐 Web Version (Deploy to Vercel)

### Steps:
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import `tarteeb` repository
5. Click "Deploy"

**Done!** Your app will be live at: `https://tarteeb.vercel.app`

Users can access from any browser, any device.

---

## 💻 Desktop Version (Electron App)

### Prerequisites:
You need Node.js installed. If you don't have it:
1. Download from https://nodejs.org/
2. Install the LTS version
3. Restart your terminal

### Build Desktop App:

#### 1. Install Dependencies:
```bash
cd c:\Users\Future\Desktop\dev\tarteeb
npm install
```

#### 2. Test Locally:
```bash
npm start
```
This opens the desktop app on your computer.

#### 3. Build Installer:

**For Windows (.exe installer):**
```bash
npm run build:win
```

**For Mac (.dmg):**
```bash
npm run build:mac
```

**For Linux (.AppImage):**
```bash
npm run build:linux
```

The installer will be in the `dist/` folder.

---

## 🔄 How They Connect

Both versions use the **same Firebase database**:

```
┌─────────────┐
│   Firebase  │ ← Single source of truth
│  (Cloud DB) │
└──────┬──────┘
       │
   ┌───┴────┐
   ↓        ↓
Web App   Desktop App
```

### User Experience:
1. User logs in on **web** → creates tasks
2. Opens **desktop app** → same tasks appear!
3. Changes in desktop → instantly sync to web
4. Works on **phone browser** too!

---

## 📤 Distribute Desktop App

### Option 1: Direct Download
1. Build the installer (`npm run build:win`)
2. Upload `dist/Tarteeb Setup 1.0.0.exe` to Google Drive
3. Share link with users

### Option 2: GitHub Releases
1. Go to https://github.com/mohamed-seyam/tarteeb/releases
2. Click "Create a new release"
3. Upload the installer from `dist/`
4. Users download from GitHub

### Option 3: Auto-Updates (Advanced)
Use `electron-updater` to push updates automatically to users.

---

## 🎯 Final Architecture

```
Users
  │
  ├─── Browser (Web) ───┐
  │                     │
  └─── Desktop App ─────┤
                        ↓
                   Firebase Auth
                   Firebase Firestore
                        │
                   (Cloud Storage)
```

**Features:**
- ✅ One account, multiple devices
- ✅ Real-time sync
- ✅ Works offline (desktop caches data)
- ✅ Automatic updates
- ✅ Same codebase for both!

---

## 🔒 Security Note

Your Firebase API keys are already in the code. This is **safe** because:
- Firebase has security rules (you set them up)
- Keys are public-facing (meant to be in client code)
- Only authenticated users can access data
- Each user can only see their own tasks

---

## 💡 Next Steps

1. **Now**: Deploy web version to Vercel (5 minutes)
2. **Then**: Install Node.js and test desktop app
3. **Finally**: Build installer and share!

Need help with any step? Just ask!
