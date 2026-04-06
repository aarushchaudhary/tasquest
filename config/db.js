const mysql = require('mysql2');
require('dotenv').config();

const isProduction = process.env.ENVIRONMENT === 'production';

const dbConfig = isProduction 
    ? {
        host: process.env.RAILWAY_DB_HOST,
        user: process.env.RAILWAY_DB_USER,
        password: process.env.RAILWAY_DB_PASSWORD,
        port: parseInt(process.env.RAILWAY_DB_PORT) || 3306,
        database: process.env.RAILWAY_DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

console.log(`[DB Config] Using ${isProduction ? 'Railway MySQL' : 'Local MariaDB'}`);
console.log(`[DB Config] Host: ${dbConfig.host}`);

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed: 🛑 " + err.message);
        console.error("Config used:", { host: dbConfig.host, user: dbConfig.user, database: dbConfig.database });
    } else {
        const dbType = isProduction ? 'Railway MySQL' : 'Local MariaDB';
        console.log(`Successfully connected to TasQuest database on ${dbType}! 🛡️`);
        connection.release();
    }
});

module.exports = pool.promise();