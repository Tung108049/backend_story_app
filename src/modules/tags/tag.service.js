const AppError = require('../../utils/AppError');
const TagRepository = require('./tag.repository');

const TagService = {
    createTag: async (name, slug) => {
        const existingTag = await TagRepository.checkDuplicate(name, slug);

        if (existingTag) {
            if (existingTag.name.toLowerCase() === name.toLowerCase()) {
                throw new AppError('Tên thẻ đã tồn tại!', 409);
            }
            throw new AppError('Slug thẻ đã tồn tại!', 409);
        }

        const idNewTag = await TagRepository.createTag(name, slug);

        return { id: idNewTag, name: name, slug: slug };
    },

    getAllTags: async () => {
        return await TagRepository.getAllTags();
    }
};

module.exports = TagService;
