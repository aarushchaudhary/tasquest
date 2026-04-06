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

router.post('/addUser', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const [result] = await db.execute(
            'INSERT INTO users (username, password, xp, level) VALUES (?, ?, 0, 1)',
            [username, password]
        );

        return res.json({ 
            success: true, 
            message: 'User added successfully',
            userId: result.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        console.error("Add User Error Code:", error.code);
        console.error("Add User Error Message:", error.message);
        console.error("Full Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Database error while adding user',
            error: error.message
        });
    }
});

router.get('/getUsers', async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, xp, level FROM users ORDER BY id'
        );

        return res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error("Get Users Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while fetching users' });
    }
});

router.delete('/removeUser/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'User deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

    } catch (error) {
        console.error("Remove User Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while deleting user' });
    }
});

router.post('/addTask', async (req, res) => {
    const { userId, name, deadline } = req.body;

    try {
        if (!userId || !name || !deadline) {
            return res.status(400).json({ success: false, message: 'User ID, name, and deadline required' });
        }

        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, name, deadline, completed) VALUES (?, ?, ?, 0)',
            [userId, name, deadline]
        );

        return res.json({ 
            success: true, 
            message: 'Task added successfully',
            taskId: result.insertId
        });

    } catch (error) {
        console.error("Add Task Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while adding task' });
    }
});

router.put('/completeTask/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
        const [result] = await db.execute(
            'UPDATE tasks SET completed = ? WHERE id = ?',
            [completed ? 1 : 0, id]
        );

        if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'Task updated successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

    } catch (error) {
        console.error("Complete Task Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while updating task' });
    }
});

router.delete('/removeTask/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );

        if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'Task deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

    } catch (error) {
        console.error("Remove Task Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while deleting task' });
    }
});

router.put('/updateUserXP', async (req, res) => {
    const { userId, xpChange } = req.body;

    try {
        if (!userId || xpChange === undefined) {
            return res.status(400).json({ success: false, message: 'User ID and XP change required' });
        }

        const [result] = await db.execute(
            'UPDATE users SET xp = xp + ? WHERE id = ?',
            [xpChange, userId]
        );

        if (result.affectedRows > 0) {
            const [users] = await db.execute(
                'SELECT id, username, xp, level FROM users WHERE id = ?',
                [userId]
            );
            
            return res.json({ 
                success: true, 
                message: 'XP updated successfully',
                user: users[0]
            });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

    } catch (error) {
        console.error("Update XP Error: ", error);
        return res.status(500).json({ success: false, message: 'Database error while updating XP' });
    }
});

module.exports = router;