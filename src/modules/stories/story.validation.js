const Joi = require('joi');

const StoryValidation = {
    createStorySchema: Joi.object({
        slug: Joi.string()
            .pattern(/^[a-z0-9\-]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang!',
                'string.empty': 'Slug không được để trống!',
                'any.required': 'Thiếu trường slug!'
            }),
        title: Joi.string().trim().min(1).max(255).required().messages({
            'string.empty': 'Tên truyện không được để trống!',
            'string.min': 'Tên truyện phải có ít nhất {#limit} ký tự!',
            'string.max': 'Tên truyện không được vượt quá {#limit} ký tự!',
            'any.required': 'Vui lòng nhập tên truyện!'
        }),
        description: Joi.string().trim().allow(null, '').optional(),
        cover_image_url: Joi.string().trim().allow(null, '').optional(),
        status: Joi.string().valid('ongoing', 'completed', 'dropped').default('ongoing'),
        content_type: Joi.string().valid('novel', 'comic').default('novel'),
        genre_ids: Joi.array().items(Joi.number().integer().positive()).optional().messages({
            'array.base': 'genre_ids phải là một mảng!',
            'number.base': 'Các phần tử trong genre_ids phải là số nguyên!',
            'number.positive': 'Các phần tử trong genre_ids phải lớn hơn 0!'
        }),
        tag_ids: Joi.array().items(Joi.number().integer().positive()).optional().messages({
            'array.base': 'tag_ids phải là một mảng!',
            'number.base': 'Các phần tử trong tag_ids phải là số nguyên!',
            'number.positive': 'Các phần tử trong tag_ids phải lớn hơn 0!'
        })
    })
};

module.exports = StoryValidation;
