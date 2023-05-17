const Joi = require("joi");
const commonHelper = require("../helper/common");

const validateCreateProduct = async (req, res, next) => {
    try {
        const schema = Joi.object({
            name: Joi.string().max(40).required(),
            stock: Joi.number().max(1000).required(),
            price: Joi.number.min(1000).max(1000000).required(),
            description: Joi.string()
        })
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

const validateUpdateProduct = async (req, res, next) => {
    try {
        const schema = Joi.object({
            name: Joi.string().max(40),
            stock: Joi.number().max(1000),
            price: Joi.number.min(1000).max(1000000),
            description: Joi.string()
        })
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

module.exports = {
    validateCreateProduct,
    validateUpdateProduct
}