const db = require('../../config/database');

const StoryRepository = {
    createStory: async (storyData) => {
        const {
            slug, title, description, cover_image_url, author_id, content_type, status,
            genre_ids, tag_ids
        } = storyData;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const query = `
                INSERT INTO stories 
                (slug, title, description, cover_image_url, author_id, content_type, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await connection.execute(query, [
                slug, title, description, cover_image_url, author_id, content_type, status
            ]);

            const newStoryId = result.insertId;

            if (genre_ids && genre_ids.length > 0) {
                const genreValues = genre_ids.map(id => [newStoryId, id]);
                await connection.query('INSERT INTO story_genres (story_id, genre_id) VALUES ?', [genreValues]);
            }

            if (tag_ids && tag_ids.length > 0) {
                const tagValues = tag_ids.map(id => [newStoryId, id]);
                await connection.query('INSERT INTO story_tags (story_id, tag_id) VALUES ?', [tagValues]);
            }

            await connection.commit();
            
            const [rows] = await db.execute('SELECT * FROM stories WHERE id = ?', [newStoryId]);
            return rows[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    checkDuplicate: async (title, slug) => {
        const query = `SELECT id FROM stories WHERE title = ? OR slug = ?`;
        const [rows] = await db.execute(query, [title, slug]);
        return rows.length > 0 ? rows[0] : null;
    },

    checkGenresExist: async (genre_ids) => {
        if (!genre_ids || genre_ids.length === 0) return true;
        const [rows] = await db.query('SELECT id FROM genres WHERE id IN (?)', [genre_ids]);
        return rows.length === genre_ids.length;
    },

    checkTagsExist: async (tag_ids) => {
        if (!tag_ids || tag_ids.length === 0) return true;
        const [rows] = await db.query('SELECT id FROM tags WHERE id IN (?)', [tag_ids]);
        return rows.length === tag_ids.length;
    },

    getStories: async (filters) => {
        const { content_type, sort_by, limit, keyword, genre_id, tag_id } = filters;

        let query = `
            SELECT s.id, s.title, s.slug, s.cover_image_url, s.status, s.content_type, s.published_at
            FROM stories s 
            WHERE 1=1
        `;
        const params = [];

        if (content_type) {
            query += ` AND s.content_type = ?`;
            params.push(content_type);
        }

        if (keyword) {
            query += ` AND s.title LIKE ?`;
            params.push(`%${keyword}%`);
        }

        if (genre_id) {
            query += ` AND EXISTS (SELECT 1 FROM story_genres sg WHERE sg.story_id = s.id AND sg.genre_id = ?)`;
            params.push(genre_id);
        }

        if (tag_id) {
            query += ` AND EXISTS (SELECT 1 FROM story_tags st WHERE st.story_id = s.id AND st.tag_id = ?)`;
            params.push(tag_id);
        }

        if (sort_by === 'views') {
            query += ` ORDER BY s.views_count DESC`;
        } else {
            query += ` ORDER BY s.published_at DESC`;
        }

        query += ` LIMIT ?`;
        params.push(Number(limit || 30));

        const [rows] = await db.execute(query, params);
        return rows;
    },

    getDetailStoryById: async (storyId) => {
        const query = `SELECT * FROM stories WHERE id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [storyId]);
        return rows[0] || null;
    }
};

module.exports = StoryRepository;
