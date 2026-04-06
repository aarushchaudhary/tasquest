const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            return res.json({ success: true, role: 'admin' });
        }

        const [users] = await db.execute(
            'SELECT id, username, xp, level FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (users.length > 0) {
            const user = users[0];

            const [tasks] = await db.execute(
                'SELECT id, name, deadline, completed FROM tasks WHERE user_id = ?',
                [user.id]
            );

            user.tasks = tasks.map(task => ({
                id: task.id,
                name: task.name,
                deadline: task.deadline,
                completed: task.completed === 1
            }));

            return res.json({ success: true, role: 'user', user: user });
            
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials. You shall not pass!' });
        }

    } catch (error) {
        console.error("Login Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while consulting the archives.' });
    }
});

module.exports = router;