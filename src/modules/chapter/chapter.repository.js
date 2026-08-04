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
        
        const imageValues = imageUrls.map((url, index) => [chapterId, url, index + 1]);
        const query = 'INSERT INTO chapter_images (chapter_id, image_url, page_number) VALUES ?';
        
        await connection.query(query, [imageValues]);
    }
};

module.exports = ChapterRepository;
