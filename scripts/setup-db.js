require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Script cho database mới. Database đã có schema thì dùng migration riêng.
async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        multipleStatements: true
    });
    try {
        await connection.query(fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8'));
        console.log('Đã tạo schema story_db.');
    } finally {
        await connection.end();
    }
}
setup().catch(error => { console.error('Setup thất bại:', error.code); process.exitCode = 1; });
