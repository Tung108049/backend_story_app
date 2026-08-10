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
        const { content_type, sort_by, limit = 30, page = 1, keyword, genre_id, tag_id } = filters;

        let query = `
            SELECT s.id, s.title, s.slug, s.cover_image_url, s.status, s.content_type, s.published_at
            FROM stories s 
            WHERE s.deleted_at IS NULL AND s.published_at IS NOT NULL
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

        query += ` LIMIT ? OFFSET ?`;
        
        const limitNumber = Number(limit) || 30;
        const pageNumber = Number(page) || 1;
        const offset = (Math.max(pageNumber, 1) - 1) * limitNumber;
        
        params.push(limitNumber, offset);

        const [rows] = await db.execute(query, params);
        return rows;
    },

    getDetailStoryById: async (storyId) => {
        const query = `SELECT * FROM stories WHERE id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [storyId]);
        return rows[0] || null;
    },

    getMyStories: async (authorId) => {
        const query = `
            SELECT id, title, slug, cover_image_url, status, content_type, published_at, created_at
            FROM stories
            WHERE author_id = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(query, [authorId]);
        return rows;
    },

    publishStory: async (storyId, connection = null) => {
        const query = `UPDATE stories SET published_at = CURRENT_TIMESTAMP WHERE id = ? AND published_at IS NULL`;
        const executor = connection || db;
        await executor.execute(query, [storyId]);
    },

    updateStory: async (storyId, updateData) => {
        const { title, description, cover_image_url, status, genre_ids, tag_ids } = updateData;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let query = 'UPDATE stories SET ';
            const params = [];
            
            if (title !== undefined) { query += 'title = ?, '; params.push(title); }
            if (description !== undefined) { query += 'description = ?, '; params.push(description); }
            if (cover_image_url !== undefined) { query += 'cover_image_url = ?, '; params.push(cover_image_url); }
            if (status !== undefined) { query += 'status = ?, '; params.push(status); }
            
            if (params.length > 0) {
                query = query.slice(0, -2) + ' WHERE id = ?';
                params.push(storyId);
                await connection.execute(query, params);
            }

            if (genre_ids !== undefined) {
                await connection.execute('DELETE FROM story_genres WHERE story_id = ?', [storyId]);
                if (genre_ids.length > 0) {
                    const genreValues = genre_ids.map(id => [storyId, id]);
                    await connection.query('INSERT INTO story_genres (story_id, genre_id) VALUES ?', [genreValues]);
                }
            }

            if (tag_ids !== undefined) {
                await connection.execute('DELETE FROM story_tags WHERE story_id = ?', [storyId]);
                if (tag_ids.length > 0) {
                    const tagValues = tag_ids.map(id => [storyId, id]);
                    await connection.query('INSERT INTO story_tags (story_id, tag_id) VALUES ?', [tagValues]);
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteStory: async (storyId) => {
        const query = `UPDATE stories SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.execute(query, [storyId]);
    }
};

module.exports = StoryRepository;
