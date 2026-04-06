// server.js
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.static('public'));

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

module.exports = app;

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`TasQuest Server is running on http://localhost:${PORT} ⚔️`);
    });
}