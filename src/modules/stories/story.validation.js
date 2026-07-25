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
        price_type: Joi.string().valid('free', 'one_time', 'per_chapter').default('free'),
        price: Joi.number()
            .precision(2)
            .min(0)
            .when('price_type', {
                is: Joi.valid('one_time', 'per_chapter'),
                then: Joi.required().messages({
                    'any.required': 'Vui lòng nhập giá cho truyện trả phí!'
                }),
                otherwise: Joi.optional().allow(null)
            })
    })
};

module.exports = StoryValidation;
