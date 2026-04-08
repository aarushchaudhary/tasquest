const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const db = require("./config/db");

setInterval(async () => {
  try {
    const [result] = await db.execute(`
            UPDATE users u
            JOIN tasks t ON u.id = t.user_id
            SET u.xp = u.xp - 20, t.penalty_applied = 1
            WHERE t.deadline < NOW()
            AND t.completed = 0
            AND t.penalty_applied = 0
        `);

    if (result.affectedRows > 0) {
      console.log(`⚔️ Auto-Penalty applied to ${result.affectedRows} tasks.`);
    }
  } catch (error) {
    console.error("Auto-Penalty Error:", error);
  }
}, 60000);

module.exports = app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`TasQuest Server is running on http://localhost:${PORT} ⚔️`);
  });
}
