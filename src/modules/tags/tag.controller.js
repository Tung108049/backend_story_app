const TagService = require('./tag.service');

const TagController = {
    createTag: async (req, res, next) => {
        try {
            const { name, slug } = req.body;
            const newTag = await TagService.createTag(name, slug);
            res.status(201).json({
                message: 'Tạo thẻ mới thành công!',
                data: newTag
            });
        } catch (error) {
            next(error);
        }
    },

    getAllTags: async (req, res, next) => {
        try {
            const tags = await TagService.getAllTags();
            res.status(200).json({
                message: 'Lấy danh sách thẻ thành công!',
                data: tags
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = TagController;
