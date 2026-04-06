# ⚔️ TasQuest

TasQuest is a multi-user, gamified task management application. It turns everyday productivity into a retro RPG experience. Users can add "quests" (tasks) with deadlines. Completing quests on time earns Experience Points (XP), while missing deadlines incurs an XP penalty. The app features a global leaderboard and a dedicated Admin panel for user management.

TasQuest features a custom-built, nostalgic Nintendo Game Boy UI theme and follows a Single Page Application (SPA) architecture.

## 🚀 Features

* **Gamified Productivity:** Earn +50 XP for completing tasks on time, or lose -20 XP for late completions.
* **Role-Based Access:** 
  * **Admin Portal:** Secure login to recruit new adventurers (create users) or banish them (delete users).
  * **User Portal:** Private dashboards for each user to manage their specific quests.
* **Global Leaderboard:** Ranks all active adventurers by their total XP.
* **Retro Theme:** Nostalgic 4-color Game Boy CSS theme with dynamic button states and monospace fonts.
* **Full Stack Integration:** AngularJS frontend communicating with a custom Express.js REST API, backed by a MySQL database.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, AngularJS (1.8.2)
* **Backend:** Node.js, Express.js
* **Database:** MySQL (using the `mysql2` driver)
* **Environment Management:** `dotenv`

## 📁 Directory Structure

```
.
├── config/
│   └── db.js                          # MySQL connection pool setup
├── public/
│   ├── index.html                     # Main SPA shell
│   ├── angular-1.8.2/                 # AngularJS library files
│   │   ├── angular.js
│   │   ├── angular.min.js
│   │   ├── angular-route.js
│   │   ├── angular-route.min.js
│   │   └── ... (other Angular modules)
│   ├── assets/                        # Images and static assets
│   ├── css/
│   │   └── style.css                  # Game Boy retro theme styling
│   ├── js/
│   │   └── app.js                     # AngularJS app, routing, and controllers
│   └── views/                         # HTML templates injected by AngularJS
│       ├── admin.html                 # Admin panel view
│       ├── dashboard.html             # User dashboard view
│       ├── leaderboard.html           # Leaderboard view
│       ├── login.html                 # Login view
│       └── profile.html               # User profile view
├── routes/
│   └── api.js                         # Express API endpoints (Login, Tasks, Users, etc.)
├── .env                               # Environment variables (DB credentials, Admin login)
├── .gitignore                         # Git ignore file
├── package.json                       # Project dependencies
├── schema.sql                         # Database schema
├── server.js                          # Node.js/Express server entry point
├── LICENSE                            # MIT License
└── README.md                          # This file
```

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v14 or higher)
* [MySQL](https://dev.mysql.com/downloads/installer/)

### 2. Database Setup
Open your MySQL client (e.g., MySQL Workbench or phpMyAdmin) and run the SQL schema provided in `schema.sql` to create the database and tables.

### 3. Environment Variables
Create a file named `.env` in the root directory and add your specific configurations:

```
PORT=3000

# Admin Portal Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=supersecretadmin123

# MySQL Database Credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=tasquest
```

### 4. Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

## 🎮 Running the Application

To start the server in development mode (which auto-restarts on file changes):
```bash
npm run dev
```

Alternatively, to run the standard server:
```bash
npm start
```

Once the server says `TasQuest Server is running... ⚔️`, open your web browser and navigate to:
**http://localhost:3000**

### Testing the Flow:
1. Log in using your `.env` Admin credentials.
2. Use the **Admin Panel** to create a new user.
3. Click **Logout**.
4. Log back in using the credentials of the user you just created.
5. Add quests to your dashboard and complete them to gain XP!

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📧 Support & Contribution

Feel free to fork this project, submit issues, or create pull requests. This project was created for educational purposes as part of the NMIMS curriculum.