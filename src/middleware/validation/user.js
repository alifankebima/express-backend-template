const Joi = require("joi");
const commonHelper = require("../helper/common");
const userModel = require("../../model/user");

const validateRegister = async (req, res, next) => {
    try {
        const schema = Joi.object({
            fullname: Joi.string().alphanum().min(3).max(40).required(),
            email: Joi.string().email().max(80).required(),
            password: Joi.string().min(3).max(128).required()
        });
        await schema.validateAsync(req.body);
        
        const findEmailResult = await userModel.findEmail(req.body.email);
        if (findEmailResult.rowCount) throw new Error("Email is already used");
        
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

        const findEmailResult = await userModel.findEmail(req.body.email);
        if (!findEmailResult.rowCount) throw new Error("Email is not registered");
        const isValidPassword = bcrypt.compareSync(
            req.body.password, 
            findEmailResult.rows[0].password
        );
        if (!isValidPassword) throw new Error("Password is invalid");

        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

const isRegistered = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().max(80).required(),
        });
        await schema.validateAsync(req.body);

        const findEmailResult = await userModel.findEmail(req.body.email);
        if (!findEmailResult.rowCount) throw new Error("Email is not registered");
 
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

const isUserExists = async (req, res, next) => {
    try {
        const id_user = req.payload.id;
        const result = await userModel.selectUser(id_user);
        if(!result.rowCount) throw new Error("User not found");
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 404, error)
    }
}

const validateToken = async (req, res, next) => {
    try {
        const schema = Joi.object({
            token: Joi.string().required()
        })
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error)
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
        await schema.validateAsync(req.body);

        next();
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 403, error);
    }
}

module.exports = { 
    validateLogin, 
    validateRegister, 
    validateUpdateUser,
    validateToken,
    isRegistered,
    isUserExists
}