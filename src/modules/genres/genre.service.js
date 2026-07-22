const AppError = require('../../utils/AppError');
const GenreRepository = require('./genre.repository');

const GenreService = {
    createGenre: async (name, slug) => {
        const existingGenre = await GenreRepository.checkDuplicate(name, slug);

        if (existingGenre) {
            if (existingGenre.name.toLowerCase() === name.toLowerCase()) {
                throw new AppError('Tên thể loại đã tồn tại!', 409);
            }
            throw new AppError('Slug thể loại đã tồn tại!', 409);
        }

        const idNewGenre = await GenreRepository.createGenre(name, slug);

        return { id: idNewGenre, name, slug };
    },

    getAllGenres: async () => {
        return await GenreRepository.getAllGenres();
    }
};

module.exports = GenreService;
