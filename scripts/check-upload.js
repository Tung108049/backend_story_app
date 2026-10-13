require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const assert = require('node:assert/strict');
const cloudinary = require('cloudinary').v2;
const db = require('../src/config/database');
const app = require('../server');

// Kiểm tra upload thật; chỉ xóa ảnh và tài khoản vừa tạo trong script này.
async function check() {
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    let userId;
    let publicId;
    try {
        const username = 'upload_test_' + crypto.randomBytes(6).toString('hex');
        const [result] = await db.execute(`
            INSERT INTO users (username, nickname, password_hash) VALUES (?, ?, ?)
        `, [username, username, await bcrypt.hash('Testing123!', 10)]);
        userId = result.insertId;
        const base = `http://127.0.0.1:${server.address().port}/api`;
        const login = await fetch(base + '/auth/login', { method: 'POST',
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: username, password: 'Testing123!' }) });
        const session = (await login.json()).data;
        const form = new FormData();
        form.append('avatar', new Blob([fs.readFileSync(path.join(__dirname, '../public/demo/page.jpg'))], { type: 'image/jpeg' }), 'demo.jpg');
        const upload = await fetch(base + '/users/update-avatar', { method: 'PUT',
            headers: { Authorization: `Bearer ${session.accessToken}` }, body: form });
        assert.equal(upload.status, 200);
        const response = await upload.json();
        const url = response.data.avatarUrl;
        publicId = 'app_truyen/avatars/' + path.posix.basename(new URL(url).pathname).replace(/\.[^.]+$/, '');
        assert.ok(url.startsWith('https://'));
        console.log('Upload avatar thật: OK');
    } finally {
        if (publicId) await cloudinary.uploader.destroy(publicId);
        if (userId) await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        await new Promise(resolve => server.close(resolve));
        await db.end();
    }
}
check().catch(error => { console.error('Upload test lỗi:', error.code || error.name); process.exitCode = 1; });
