const Joi = require("joi");
const commonHelper = require("../helper/common");

const validateRegister = async (req, res, next) => {
    try {
        const schema = Joi.object({
            fullname: Joi.string().alphanum().min(3).max(40).required(),
            email: Joi.string().email().max(80).required(),
            password: Joi.string().min(3).max(128).required()
        });
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

const validateLogin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().max(80).required(),
            password: Joi.string().min(3).max(128).required()
        });
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

const validateUpdateUser = async (req, res, next) => {
    try {
        const schema = Joi.object({
            fullname: Joi.string().alphanum().min(3).max(40),
            password: Joi.string().min(3).max(128),
            phone_number: Joi.string().min(10),
            address: Joi.string().max(255)
        });
        await schema.validateAsync(req.body)
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

module.exports = { 
    validateLogin, 
    validateRegister, 
    validateUpdateUser
}