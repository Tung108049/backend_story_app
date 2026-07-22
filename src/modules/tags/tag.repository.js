const db = require('../../config/database');

const TagRepository = {
    createTag: async (name, slug) => {
        const query = `INSERT INTO tags (name, slug) VALUES (?, ?)`;
        const result = await db.query(query, [name, slug]);
        return result.insertId;
    },

    getAllTags: async () => {
        const query = `SELECT * FROM tags ORDER BY name ASC`;
        const [rows] = await db.query(query);
        return rows;
    },

    checkDuplicate: async (name, slug) => {
        const query = `SELECT * FROM tags WHERE name = ? OR slug = ?`;
        const [rows] = await db.query(query, [name, slug]);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = TagRepository;
