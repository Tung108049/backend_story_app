const Joi = require('joi');

const TagValidation = {
    createTagSchema: Joi.object({
        name: Joi.string().trim().required().messages({
            'string.empty': 'Tên thể loại không được để trống!',
            'any.required': 'Không tìm thấy tên thể loại!'
        }),
        slug: Joi.string()
            .trim()
            .pattern(/^[a-z0-9\-]+$/)
            .required()
            .messages({
                'string.empty': 'Slug không được để trống',
                'string.pattern.base':
                    'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang(-)!',
                'any.required': 'Không tìm thấy slug!'
            })
    })
};

module.exports = TagValidation;
