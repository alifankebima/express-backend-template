const Joi = require("joi");
const commonHelper = require("../helper/common");

const validateCreateTransaction = async (req, res, next) => {
    try {
        const schema = Joi.object({
            paid_amount: Joi.number().max(10000000).required(),
            products: Joi.array.items(Joi.string().guid({version: 'uuidv4'})).min(1).required()
        });
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

const validateUpdateTransaction = async (req, res, next) => {
    try {
        const schema = Joi.object({
            paid_amount: Joi.number().max(10000000).required(),
            products: Joi.array.items(Joi.string().guid({version: 'uuidv4'}))
        });
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

module.exports = {
    validateCreateTransaction,
    validateUpdateTransaction
}