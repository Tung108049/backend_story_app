const db = require('../../config/database');

const ChapterRepository = {
    createChapterInfo: async (connection, chapterData) => {
        const { story_id, chapter_number, title, content, status } = chapterData;
        
        const query = `
            INSERT INTO chapters (story_id, chapter_number, title, content, status) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.execute(query, [
            story_id, chapter_number, title || null, content || null, status || 'draft'
        ]);
        
        return result.insertId;
    },

    createChapterImages: async (connection, chapterId, imageUrls) => {
        if (!imageUrls || imageUrls.length === 0) return;
        
        // Theo ý tưởng Gapped Integer: nhân 100 để tạo khoảng trống
        const imageValues = imageUrls.map((url, index) => [chapterId, url, (index + 1) * 100]);
        const query = 'INSERT INTO chapter_images (chapter_id, image_url, page_number) VALUES ?';
        
        await connection.query(query, [imageValues]);
    },

    getChapterById: async (chapterId) => {
        const query = `SELECT * FROM chapters WHERE id = ?`;
        const [rows] = await db.execute(query, [chapterId]);
        return rows[0] || null;
    },

    getChapterImagesByChapterId: async (chapterId) => {
        const query = `SELECT * FROM chapter_images WHERE chapter_id = ? ORDER BY page_number ASC`;
        const [rows] = await db.execute(query, [chapterId]);
        return rows;
    },

    updateChapterInfo: async (chapterId, updateData) => {
        const { chapter_number, title, content, status } = updateData;
        let query = 'UPDATE chapters SET ';
        const params = [];
        
        if (chapter_number !== undefined) {
            query += 'chapter_number = ?, ';
            params.push(chapter_number);
        }
        if (title !== undefined) {
            query += 'title = ?, ';
            params.push(title);
        }
        if (content !== undefined) {
            query += 'content = ?, ';
            params.push(content);
        }
        if (status !== undefined) {
            query += 'status = ?, ';
            params.push(status);
        }
        
        query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        params.push(chapterId);
        
        await db.execute(query, params);
    },

    // Các hàm cho xử lý Comic Image
    checkImageExists: async (chapterId, pageNumber) => {
        const query = `SELECT id FROM chapter_images WHERE chapter_id = ? AND page_number = ?`;
        const [rows] = await db.execute(query, [chapterId, pageNumber]);
        return rows.length > 0;
    },

    updateChapterImage: async (chapterId, pageNumber, newImageUrl) => {
        const query = `UPDATE chapter_images SET image_url = ? WHERE chapter_id = ? AND page_number = ?`;
        await db.execute(query, [newImageUrl, chapterId, pageNumber]);
    },

    insertChapterImage: async (chapterId, pageNumber, imageUrl) => {
        const query = `INSERT INTO chapter_images (chapter_id, image_url, page_number) VALUES (?, ?, ?)`;
        await db.execute(query, [chapterId, imageUrl, pageNumber]);
    },

    deleteChapterImage: async (chapterId, pageNumber) => {
        const query = `DELETE FROM chapter_images WHERE chapter_id = ? AND page_number = ?`;
        await db.execute(query, [chapterId, pageNumber]);
    },

    deleteChapterById: async (chapterId) => {
        const query = `DELETE FROM chapters WHERE id = ?`;
        await db.execute(query, [chapterId]);
    },

    //Lấy các chapter đang có trong truyện
    getChaptersByStoryId: async (storyId) => {
        let query = `
            SELECT id, chapter_number, title, status, views_count, created_at
            FROM chapters
            WHERE story_id = ?
            ORDER BY chapter_number ASC
        `;
        const [rows] = await db.execute(query, [storyId]);
        return rows;
    },

};

module.exports = ChapterRepository;
