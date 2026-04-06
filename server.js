// server.js
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

app.use(express.static('public'));

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`TasQuest Server is running on http://localhost:${PORT} ⚔️`);
});