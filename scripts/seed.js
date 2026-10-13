require('dotenv').config({ quiet: true });
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

// Chỉ thêm dữ liệu mẫu, không xóa dữ liệu đã có. Chạy lại không nhân bản.
async function seed() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const hash = await bcrypt.hash('HocTruyen123!', 10);
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash, nickname)
            VALUES (?, ?, ?, ?)
        `, ['demo_reader', 'reader@example.test', hash, 'Bạn đọc thử']);
        const [users] = await connection.execute('SELECT id FROM users WHERE username = ?', ['demo_reader']);
        const userId = users[0].id;
        await connection.execute('INSERT IGNORE INTO genres (name, slug) VALUES (?, ?)', ['Phiêu lưu', 'phieu-luu']);
        const [genres] = await connection.execute('SELECT id FROM genres WHERE slug = ?', ['phieu-luu']);
        for (const type of ['novel', 'comic']) {
            const slug = `demo-${type}`;
            await connection.execute(`
                INSERT IGNORE INTO stories (slug, title, description, author_id, content_type, published_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [slug, type === 'novel' ? 'Chuyến tàu lúc bình minh' : 'Những trang tranh đầu tiên',
                'Nội dung mẫu của dự án, dùng để học và kiểm tra luồng đọc.', userId, type]);
            const [stories] = await connection.execute('SELECT id FROM stories WHERE slug = ?', [slug]);
            const storyId = stories[0].id;
            await connection.execute('INSERT IGNORE INTO story_genres (story_id, genre_id) VALUES (?, ?)', [storyId, genres[0].id]);
            for (let number = 1; number <= 3; number++) {
                await connection.execute(`
                    INSERT IGNORE INTO chapters (story_id, chapter_number, title, content, status)
                    VALUES (?, ?, ?, ?, ?)
                `, [storyId, number, `Chương ${number}: ${number === 3 ? 'Bản nháp' : 'Khởi hành'}`,
                    type === 'novel' ? ('Bình minh lên trên sân ga. An mở cuốn sổ, ghi lại những điều mình muốn khám phá.\n\n' +
                        'Chuyến tàu bắt đầu chuyển bánh. Một hành trình mới đang chờ phía trước.\n\n').repeat(12) : null,
                    number === 3 ? 'draft' : 'published']);
                if (type === 'comic') {
                    const [chapters] = await connection.execute('SELECT id FROM chapters WHERE story_id = ? AND chapter_number = ?', [storyId, number]);
                    for (const page of [100, 200]) {
                        await connection.execute(`
                            INSERT IGNORE INTO chapter_images (chapter_id, image_url, page_number)
                            VALUES (?, ?, ?)
                        `, [chapters[0].id, '/demo/page.jpg', page]);
                    }
                }
            }
        }
        await connection.commit();
        console.log('Đã thêm dữ liệu mẫu. Tài khoản: reader@example.test / HocTruyen123!');
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

seed().catch(error => { console.error('Seed thất bại:', error.code || error.message); process.exitCode = 1; })
    .finally(() => db.end());
