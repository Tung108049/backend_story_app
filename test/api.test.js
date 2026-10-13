require('dotenv').config({ quiet: true });
const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const db = require('../src/config/database');
const app = require('../server');

test('API với MySQL thật: tài khoản, truyện, chương và thư viện', async t => {
    const suffix = crypto.randomBytes(6).toString('hex');
    const userIds = [];
    const storyIds = [];
    const genreIds = [];
    const tagIds = [];
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function request(path, method = 'GET', body, token) {
        const response = await fetch(base + path, {
            method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        return { status: response.status, body: await response.json() };
    }
    async function createUser(name, role = 'user') {
        const username = `${name}_${suffix}`;
        const password = 'Testing123!';
        const [result] = await db.execute(`
            INSERT INTO users (username, email, password_hash, nickname, role)
            VALUES (?, ?, ?, ?, ?)
        `, [username, `${username}@example.test`, await bcrypt.hash(password, 10), name, role]);
        userIds.push(result.insertId);
        const login = await request('/auth/login', 'POST', { identifier: username, password });
        assert.equal(login.status, 200);
        return { id: result.insertId, ...login.body.data };
    }
    try {
        const author = await createUser('author');
        const reader = await createUser('reader');
        const admin = await createUser('admin', 'admin');
        let storyId;
        let chapterId;
        let draftId;
        await t.test('Thể loại/thẻ trả ID; input sai bị từ chối', async () => {
            assert.equal((await request('/genres')).status, 200);
            const genre = await request('/genres', 'POST', { name: `Genre ${suffix}`, slug: `genre-${suffix}` }, admin.accessToken);
            assert.equal(genre.status, 201); assert.ok(genre.body.data.id); genreIds.push(genre.body.data.id);
            const tag = await request('/tags', 'POST', { name: `Tag ${suffix}`, slug: `tag-${suffix}` }, admin.accessToken);
            assert.equal(tag.status, 201); assert.ok(tag.body.data.id); tagIds.push(tag.body.data.id);
            assert.equal((await request('/stories?limit=-1')).status, 400);
            assert.equal((await request('/stories/abc')).status, 400);
            assert.equal((await request('/chapters/-1')).status, 400);
            assert.equal((await request('/stories?content_type=bad')).status, 400);
            assert.equal((await request('/auth/register', 'POST', { username: 'bad-name', email: 'bad@example.test', password: 'Testing123!' })).status, 400);
        });
        await t.test('Truyện chưa xuất bản/chương nháp không công khai; quyền tác giả', async () => {
            const story = await request('/stories', 'POST', {
                title: `Story ${suffix}`, slug: `story-${suffix}`, content_type: 'novel', genre_ids: genreIds
            }, author.accessToken);
            assert.equal(story.status, 201); storyId = story.body.data.id; storyIds.push(storyId);
            assert.equal((await request(`/stories/${storyId}`)).status, 404);
            const draft = await request(`/stories/${storyId}/chapters`, 'POST', { chapter_number: 2, title: 'Draft', content: 'Secret' }, author.accessToken);
            assert.equal(draft.status, 201); draftId = draft.body.data.id;
            assert.equal((await request(`/chapters/${draftId}`)).status, 404);
            const chapter = await request(`/stories/${storyId}/chapters`, 'POST', { chapter_number: 1, content: 'Published text', status: 'published' }, author.accessToken);
            assert.equal(chapter.status, 201); chapterId = chapter.body.data.id;
            const detail = await request(`/stories/${storyId}`);
            assert.equal(detail.status, 200); assert.equal(detail.body.data.chapters.length, 1);
            const list = await request(`/stories?keyword=${suffix}`);
            assert.equal(list.status, 200); assert.deepEqual(list.body.data[0].genres, [`Genre ${suffix}`]);
            assert.equal(list.body.data[0].author_name, 'author');
            assert.equal((await request(`/chapters/${chapterId}`)).body.data.content, 'Published text');
            assert.equal((await request(`/stories/${storyId}`, 'PUT', { title: 'Stolen' }, reader.accessToken)).status, 403);
            assert.equal((await request(`/chapters/${chapterId}`, 'DELETE', undefined, reader.accessToken)).status, 403);
        });
        await t.test('Tủ sách/lịch sử cách ly theo người dùng và không lưu nháp', async () => {
            assert.equal((await request('/library/bookshelf')).status, 401);
            assert.equal((await request('/library/bookshelf', 'POST', { story_id: storyId }, reader.accessToken)).status, 201);
            assert.equal((await request('/library/bookshelf', 'POST', { story_id: storyId }, reader.accessToken)).status, 201);
            assert.equal((await request('/library/bookshelf', 'GET', undefined, reader.accessToken)).body.data.length, 1);
            assert.equal((await request('/library/bookshelf', 'GET', undefined, author.accessToken)).body.data.length, 0);
            assert.equal((await request('/library/history', 'PUT', { chapter_id: draftId }, reader.accessToken)).status, 404);
            assert.equal((await request('/library/history', 'PUT', { chapter_id: chapterId }, reader.accessToken)).status, 200);
            assert.equal((await request('/library/history', 'GET', undefined, reader.accessToken)).body.data[0].chapter_id, chapterId);
            await request(`/library/bookshelf/${storyId}`, 'DELETE', undefined, reader.accessToken);
            assert.equal((await request('/library/bookshelf', 'GET', undefined, reader.accessToken)).body.data.length, 0);
            await request('/library/history', 'DELETE', undefined, reader.accessToken);
            assert.equal((await request('/library/history', 'GET', undefined, reader.accessToken)).body.data.length, 0);
        });
        await t.test('Truyện tranh trả ảnh đúng thứ tự; xóa chương dọn ảnh', async () => {
            const story = await request('/stories', 'POST', {
                title: `Comic ${suffix}`, slug: `comic-${suffix}`, content_type: 'comic'
            }, author.accessToken);
            assert.equal(story.status, 201);
            const comicId = story.body.data.id;
            storyIds.push(comicId);
            const chapter = await request(`/stories/${comicId}/chapters`, 'POST', {
                chapter_number: 1, title: 'Comic chapter', status: 'published'
            }, author.accessToken);
            assert.equal(chapter.status, 201);
            const id = chapter.body.data.id;
            await db.execute('INSERT INTO chapter_images (chapter_id, image_url, page_number) VALUES (?, ?, ?), (?, ?, ?)',
                [id, '/demo/page.jpg', 200, id, '/demo/page.jpg', 100]);
            const result = await request(`/chapters/${id}`);
            assert.equal(result.status, 200);
            assert.deepEqual(result.body.data.images.map(image => image.page_number), [100, 200]);
            assert.equal((await request(`/chapters/${id}`, 'PUT', { content: 'Text' }, author.accessToken)).status, 400);
            assert.equal((await request(`/chapters/${id}`, 'DELETE', undefined, author.accessToken)).status, 200);
            const [images] = await db.execute('SELECT id FROM chapter_images WHERE chapter_id = ?', [id]);
            assert.equal(images.length, 0);
            assert.equal((await request(`/stories/${comicId}`)).status, 404);
        });
        await t.test('Google: xác minh qua thư viện; tạo/tìm identity; từ chối token lỗi', async () => {
            const originalVerify = OAuth2Client.prototype.verifyIdToken;
            const originalClient = process.env.GOOGLE_CLIENT_ID;
            process.env.GOOGLE_CLIENT_ID = 'test-client';
            try {
                OAuth2Client.prototype.verifyIdToken = async options => {
                    assert.equal(options.audience, 'test-client');
                    if (options.idToken !== 'test-valid') throw new Error('invalid token');
                    return { getPayload: () => ({ sub: `google-${suffix}`, email: `google_${suffix}@example.test`, email_verified: true, name: 'Google test' }) };
                };
                assert.equal((await request('/auth/google', 'POST', { idToken: 'invalid' })).status, 401);
                const first = await request('/auth/google', 'POST', { idToken: 'test-valid' });
                assert.equal(first.status, 200); userIds.push(first.body.data.user.id);
                const second = await request('/auth/google', 'POST', { idToken: 'test-valid' });
                assert.equal(second.body.data.user.id, first.body.data.user.id);
                assert.equal((await request('/users/me', 'GET', undefined, second.body.data.accessToken)).status, 200);
            } finally {
                OAuth2Client.prototype.verifyIdToken = originalVerify;
                if (originalClient === undefined) delete process.env.GOOGLE_CLIENT_ID;
                else process.env.GOOGLE_CLIENT_ID = originalClient;
            }
        });
        await t.test('Refresh, logout và tài khoản bị khóa', async () => {
            const [users] = await db.execute('SELECT refresh_token FROM users WHERE id = ?', [reader.id]);
            assert.notEqual(users[0].refresh_token, reader.refreshToken);
            const expired = jwt.sign({ id: reader.id, sessionHash: users[0].refresh_token }, process.env.JWT_ACCESS_SECRET, { expiresIn: -1 });
            assert.equal((await request('/users/me', 'GET', undefined, expired)).status, 401);
            const refreshed = await request('/auth/refresh', 'POST', { refreshToken: reader.refreshToken });
            assert.equal(refreshed.status, 200);
            assert.equal((await request('/users/me', 'GET', undefined, refreshed.body.data.accessToken)).status, 200);
            assert.equal((await request('/auth/logout', 'POST', {}, reader.accessToken)).status, 200);
            assert.equal((await request('/users/me', 'GET', undefined, reader.accessToken)).status, 401);
            assert.equal((await request('/auth/refresh', 'POST', { refreshToken: reader.refreshToken })).status, 401);
            await db.execute("UPDATE users SET status = 'banned' WHERE id = ?", [author.id]);
            assert.equal((await request('/users/me', 'GET', undefined, author.accessToken)).status, 401);
        });
    } finally {
        for (const id of storyIds) await db.execute('DELETE FROM stories WHERE id = ?', [id]);
        for (const id of genreIds) await db.execute('DELETE FROM genres WHERE id = ?', [id]);
        for (const id of tagIds) await db.execute('DELETE FROM tags WHERE id = ?', [id]);
        for (const id of userIds) await db.execute('DELETE FROM users WHERE id = ?', [id]);
        await new Promise(resolve => server.close(resolve));
        await db.end();
    }
});
