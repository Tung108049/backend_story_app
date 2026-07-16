const AppError = require('../../utils/AppError');
const GenreRepository = require('./genre.repository');

const GenreService = {
    createGenre: async (name, slug) => {
        const existingGenre = await GenreRepository.checkDuplicate(name, slug);

        if (existingGenre) {
            if (existingGenre.name.toLowerCase() === name.toLowerCase()) {
                throw new AppError('Tên thể loại đã tồn tại!', 409);
            }
            throw new AppError('Slug đã tồn tại!', 409);
        }

        const id = await GenreRepository.createGenre(name, slug);

        return { id: id, name, slug };
    },

    getAllGenre: async () => {
        return await GenreRepository.getAllGenres();
    }
};

module.exports = GenreService;
