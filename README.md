# ⚔️ TasQuest

> A gamified task management SPA with a retro Game Boy theme. Complete tasks to earn XP, climb the leaderboard, and become the ultimate productivity warrior!

TasQuest is a multi-user, gamified task management application. It turns everyday productivity into a retro RPG experience. Users can add "quests" (tasks) with deadlines. Completing quests on time earns Experience Points (XP), while missing deadlines incurs an XP penalty. The app features a global leaderboard and a dedicated Admin panel for user management.

TasQuest features a custom-built, nostalgic Nintendo Game Boy UI theme and follows a Single Page Application (SPA) architecture with persistent session storage.

## 🚀 Features

* **Gamified Productivity:** Earn +50 XP for completing tasks on time, or lose -20 XP for late completions.
* **Persistent Sessions:** Automatically saves login state and user data to browser localStorage—stay logged in even after refresh!
* **Real-time Data Sync:** All user actions (task creation, completion, XP changes) instantly sync with the MySQL database.
* **Role-Based Access:** 
  * **Admin Portal:** Secure login to recruit new adventurers (create users) or banish them (delete users).
  * **User Portal:** Private dashboards for each user to manage their specific quests.
* **Global Leaderboard:** Ranks all active adventurers by their total XP, refreshing in real-time.
* **Retro Theme:** Nostalgic 4-color Game Boy CSS theme with dynamic button states, monospace fonts, and responsive design.
* **Full Stack Integration:** AngularJS frontend communicating with a custom Express.js REST API, backed by a MySQL database.
* **Angular CDN Fallback:** If local Angular files fail to load, automatically falls back to Google's CDN.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, AngularJS (1.8.2) with localStorage for persistent sessions
* **Backend:** Node.js, Express.js
* **Database:** MySQL (using the `mysql2` driver)
* **Environment Management:** `dotenv`
* **Styling:** Retro Game Boy 4-color theme with responsive design

## 📡 API Endpoints

### Authentication
* `POST /api/login` - Authenticate user or admin

### User Management
* `GET /api/getUsers` - Fetch all users (for leaderboard and admin panel)
* `POST /api/addUser` - Create new user (admin only)
* `DELETE /api/removeUser/:id` - Delete user (admin only)

### Task Management
* `POST /api/addTask` - Create a new task for user
* `PUT /api/completeTask/:id` - Mark task as complete
* `DELETE /api/removeTask/:id` - Delete a task

### Experience Points
* `PUT /api/updateUserXP` - Update user XP and level

## 📁 Directory Structure

```
.
├── config/
│   └── db.js                          # MySQL connection pool setup
├── public/
│   ├── index.html                     # Main SPA shell with Angular CDN fallback
│   ├── angular-1.8.2/                 # AngularJS library files
│   │   ├── angular.min.js
│   │   └── angular-route.min.js
│   ├── assets/                        # Images and static assets
│   ├── css/
│   │   └── style.css                  # Game Boy retro theme with flexbox layout
│   ├── js/
│   │   └── app.js                     # AngularJS routing, controllers, services
│   └── views/                         # HTML templates injected by ng-view
│       ├── admin.html                 # Admin panel (user management)
│       ├── dashboard.html             # User dashboard (task management)
│       ├── leaderboard.html           # Global XP rankings
│       ├── login.html                 # Login page
│       └── profile.html               # User profile view
├── routes/
│   └── api.js                         # Express REST API endpoints
├── .env                               # Environment variables
├── .gitignore                         # Git ignore file
├── package.json                       # Node.js dependencies
├── schema.sql                         # MySQL database schema
├── server.js                          # Express server entry point
├── LICENSE                            # MIT License
└── README.md                          # This file
```

## ⚙️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v14+)
* [MySQL](https://dev.mysql.com/downloads/installer/)

### 1. Database Setup
Run `schema.sql` in your MySQL client to create the database and tables:
```bash
mysql -u root -p < schema.sql
```

### 2. Environment Configuration
Create `.env` in the project root:
```env
PORT=3000

# Admin Portal Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tasquest
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
npm run dev    # With auto-reload
# or
npm start      # Standard start
```

Visit **http://localhost:3000** ⚔️

## 🎮 Usage Guide

### As Admin:
1. Login with admin credentials from `.env`
2. View all users in the Admin Panel
3. Create new users (recruit adventurers)
4. Delete users (banish adventurers)

### As User:
1. Login with your username and password
2. **Dashboard**: Add quests with deadlines
3. **Complete Tasks**: Click "Complete" button
   - ✅ On time: +50 XP
   - ⏰ Late: -20 XP
4. **Leaderboard**: See global rankings
5. **Profile**: View your stats
6. **Logout**: Clears session and localStorage

### Session Persistence:
- Your login session is saved to browser localStorage
- Refresh the page? You stay logged in!
- Logout clears the session
- All task data syncs with the database in real-time

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Fork the repository
- Submit issues and bug reports
- Create pull requests with improvements

## 📚 Learning Resources

This project demonstrates:
- Single Page Application (SPA) architecture
- RESTful API design with Express.js
- AngularJS frontend framework and routing
- MySQL database design and queries
- Session management with localStorage
- Responsive CSS with flexbox layout
- Node.js environment configuration

**Happy questing! Level up your productivity with TasQuest! ⚔️**