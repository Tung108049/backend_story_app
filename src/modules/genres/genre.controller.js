const GenreService = require('./genre.service');

const GenreController = {
    createGenre: async (req, res, next) => {
        try {
            const { name, slug } = req.body;
            const newGenre = await GenreService.createGenre(name, slug);
            res.status(201).json({
                message: 'Tạo thể loại mới thành công!',
                data: newGenre
            });
        } catch (error) {
            next(error);
        }
    },

    getAllGenres: async (req, res, next) => {
        try {
            const genres = await GenreService.getAllGenre();
            res.status(200).json({
                message: 'Lấy danh sách thể loại thành công!',
                data: genres
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = GenreController;
