const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function initDatabase() {
    try {
        // Connect to MySQL without specifying database first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Root@password'
        });

        console.log('Connected to MySQL');

        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ai_secure_finance'}`);
        console.log('Database created or already exists');

        // Switch to the database
        await connection.changeUser({ database: process.env.DB_NAME || 'ai_secure_finance' });
        console.log('Switched to database');

        // Read and execute the init.sql file
        const sql = fs.readFileSync('./database/init.sql', 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            }
        }

        console.log('Database initialization completed!');
        await connection.end();
        
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();
