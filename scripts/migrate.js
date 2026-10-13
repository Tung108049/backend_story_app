require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function migrate() {
    const sql = fs.readFileSync(path.join(__dirname, '../database/library.sql'), 'utf8');
    for (const statement of sql.split(';').filter(value => value.trim())) await db.query(statement);
    console.log('Đã tạo bảng tủ sách/lịch sử. Không thay đổi dữ liệu cũ.');
}
migrate().catch(error => { console.error('Migration lỗi:', error.code); process.exitCode = 1; })
    .finally(() => db.end());
