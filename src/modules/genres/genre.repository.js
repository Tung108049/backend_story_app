const db = require('../../config/database');

const GenreRepository = {
    createGenre: async (name, slug) => {
        const query = `INSERT INTO genres (name, slug) VALUES(?, ?)`;
        const result = await db.execute(query, [name, slug]);
        return result.insertId;
    },

    getAllGenres: async () => {
        const query = `SELECT * FROM genres ORDER BY name ASC`;
        const [rows] = await db.execute(query);
        return rows;
    },

    checkDuplicate: async (name, slug) => {
        const query = `SELECT * FROM genres WHERE name = ? OR slug = ?`;
        const [rows] = await db.execute(query, [name, slug]);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = GenreRepository;
