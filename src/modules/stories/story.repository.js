const db = require('../../config/database');

const StoryRepository = {
    createStory: async (storyData) => {
        const { slug, title, description, cover_image_url, author_id, content_type, status } =
            storyData;
        const query = `
            INSERT INTO stories 
            (slug, title, description, cover_image_url, author_id, content_type, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            slug,
            title,
            description,
            cover_image_url,
            author_id,
            content_type,
            status
        ]);

        const [rows] = await db.execute('SELECT * FROM stories WHERE id = ?', [result.insertId]);
        const newStory = rows[0];
        return newStory;
    },

    checkDuplicate: async (title, slug) => {
        const query = `SELECT id FROM stories WHERE title = ? OR slug = ?`;
        const [rows] = await db.execute(query, [title, slug]);
        return rows.length > 0 ? rows[0] : null;
    },

    getStories: async (filters) => {
        const { content_type, sort_by, limit, keyword, genre_id, tag_id } = filters;

        let query = `
            SELECT s.id, s.title, s.slug, s.cover_image_url, s.status, s.content_type, s.created_at 
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
            query += ` ORDER BY s.created_at DESC`;
        }

        query += ` LIMIT ?`;
        params.push(Number(limit || 30));

        const [rows] = await db.execute(query, params);
        return rows;
    }
};

module.exports = StoryRepository;
