require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

async function check() {
    const name = 'story_schema_test_' + crypto.randomBytes(6).toString('hex');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, multipleStatements: true
    });
    try {
        const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8').replaceAll('story_db', name);
        const library = fs.readFileSync(path.join(__dirname, '../database/library.sql'), 'utf8');
        await connection.query(schema);
        await connection.query(library);
        await connection.query(schema);
        await connection.query(library);
        const [tables] = await connection.query('SHOW TABLES');
        assert.equal(tables.length, 11);
        console.log('Schema mới và chạy lại: OK, 11 bảng.');
    } finally {
        if (!/^story_schema_test_[a-f0-9]{12}$/.test(name)) throw new Error('Tên database test không hợp lệ');
        await connection.query(`DROP DATABASE IF EXISTS \`${name}\``);
        await connection.end();
    }
}
check().catch(error => { console.error('Schema test lỗi:', error.code || error.message); process.exitCode = 1; });
