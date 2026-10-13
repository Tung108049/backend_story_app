const db = require('../../config/database');

const LibraryRepository = {
    getBookshelf: async userId => {
        const [rows] = await db.execute(`
            SELECT s.*, u.nickname AS author_name
            FROM bookshelf b
            JOIN stories s ON s.id = b.story_id
            JOIN users u ON u.id = s.author_id
            WHERE b.user_id = ? AND s.deleted_at IS NULL AND s.published_at IS NOT NULL
              AND EXISTS (SELECT 1 FROM chapters c WHERE c.story_id = s.id AND c.status = 'published')
            ORDER BY b.created_at DESC, s.id DESC LIMIT 100
        `, [userId]);
        return rows;
    },

    addBookmark: async (userId, storyId) => {
        await db.execute('INSERT IGNORE INTO bookshelf (user_id, story_id) VALUES (?, ?)', [userId, storyId]);
    },

    removeBookmark: async (userId, storyId) => {
        await db.execute('DELETE FROM bookshelf WHERE user_id = ? AND story_id = ?', [userId, storyId]);
    },

    getHistory: async userId => {
        const [rows] = await db.execute(`
            SELECT s.*, u.nickname AS author_name, h.chapter_id,
                   c.chapter_number, c.title AS chapter_title, h.updated_at AS read_at
            FROM reading_history h
            JOIN stories s ON s.id = h.story_id
            JOIN chapters c ON c.id = h.chapter_id
            JOIN users u ON u.id = s.author_id
            WHERE h.user_id = ? AND s.deleted_at IS NULL
              AND s.published_at IS NOT NULL AND c.status = 'published'
            ORDER BY h.updated_at DESC, s.id DESC LIMIT 100
        `, [userId]);
        return rows;
    },

    saveHistory: async (userId, chapter) => {
        await db.execute(`
            INSERT INTO reading_history (user_id, story_id, chapter_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE chapter_id = VALUES(chapter_id), updated_at = CURRENT_TIMESTAMP
        `, [userId, chapter.story_id, chapter.id]);
    },

    clearHistory: async userId => {
        await db.execute('DELETE FROM reading_history WHERE user_id = ?', [userId]);
    }
};

module.exports = LibraryRepository;
