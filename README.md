# Tarteeb - Smart Task Manager

**Organize Your Tasks Smartly** with focus mode, Pomodoro timer, and cloud sync.

![Tarteeb](./public/favicon.svg)

## ✨ Features

- 🎯 **Focus Mode** - Distraction-free full-screen timer
- ⏱️ **Pomodoro Timer** - Built-in timer for focused work
- 📋 **Task Management** - Drag-and-drop Kanban board
- ☁️ **Cloud Sync** - Firebase integration for multi-device access
- 🔐 **User Authentication** - Secure email/password login
- 🌙 **Dark Theme** - Beautiful gradient UI
- 💻 **Desktop App** - Available as Electron app
- 🌐 **Web App** - Access from any browser

## 🚀 Live Demo

Visit: [tarteeb.vercel.app](https://tarteeb.vercel.app)

## 📁 Project Structure

```
tarteeb/
├── public/              # Static assets
│   ├── favicon.svg      # App icon
│   └── assets/          # Images and media
│
├── src/
│   ├── app.js           # Main application bundle
│   ├── components/      # React components
│   │   ├── AuthForm.js
│   │   ├── TaskItem.js
│   │   ├── TaskColumn.js
│   │   ├── FocusPanel.js
│   │   ├── FocusMode.js
│   │   └── AddTaskForm.js
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   ├── useTasksFirestore.js
│   │   └── useTimer.js
│   │
│   ├── utils/           # Helper functions
│   │   └── helpers.js
│   │
│   ├── config/          # Configuration files
│   │   └── firebase.js
│   │
│   ├── constants/       # App constants
│   │   └── index.js
│   │
│   └── styles/          # CSS styles
│       └── main.css
│
├── index.html           # Web app entry point
├── electron-main.js     # Desktop app entry point
├── package.json         # Dependencies and scripts
└── vercel.json          # Deployment configuration
```

## 🛠️ Tech Stack

- **Frontend**: React 18 (via CDN)
- **Styling**: CSS3 with custom variables
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Desktop**: Electron
- **Hosting**: Vercel
- **Build**: Babel Standalone (JSX transpilation)

## 💻 Local Development

### Web Version

1. Clone the repository:
```bash
git clone https://github.com/mohamed-seyam/tarteeb.git
cd tarteeb
```

2. Open with Live Server or any local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

3. Open `http://localhost:8000` in your browser

### Desktop App

1. Install dependencies:
```bash
npm install
```

2. Run desktop app:
```bash
npm start
```

3. Build installer:
```bash
# Windows
npm run build:win

# Mac
npm run build:mac

# Linux
npm run build:linux
```

## 🔥 Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)

2. Enable Email/Password authentication

3. Create a Firestore database

4. Update Firebase config in `src/app.js` (lines 6-14)

5. Set Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📤 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Deploy automatically

### Share Desktop App

Build the installer and share the file from `dist/` folder.

## 🎯 Usage

1. **Sign Up/Login** - Create an account or login
2. **Add Tasks** - Enter task name, time estimate, and date
3. **Organize** - Drag tasks between columns (Week → Today → In Progress → Done)
4. **Focus** - Click "FOCUS NOW" for distraction-free mode
5. **Track** - See your stats and completed tasks

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

**Made with ❤️ by [Seyam](https://github.com/mohamed-seyam)**

## 🙏 Acknowledgments

- React for the amazing library
- Firebase for backend infrastructure
- Vercel for free hosting
- Google Fonts for beautiful typography

---

**Star ⭐ this repo if you find it useful!**
