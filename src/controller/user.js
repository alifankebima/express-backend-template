const { v4: uuidv4 } = require('uuid');
const googleDrive = require('../config/googleDrive');
const commonHelper = require('../helper/common');
const authHelper = require("../helper/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const email = require('../config/mail');
const userModel = require('../model/user');

const registerUser = async (req, res) => {
    try {
        const data = req.body;
        const salt = bcrypt.genSaltSync(10);

        data.id = uuidv4();
        data.email = data.email.toLowerCase();
        data.password = bcrypt.hashSync(data.password, salt);
        data.created_at = new Date(Date.now()).toISOString();
        data.updated_at = data.created_at;
        const result = await userModel.insertUser(data);

        const payload = { 
            email: data.email 
        }
        const token = authHelper.generateToken(payload);
        email.sendMail(data.email, token, "example app email verification");

        commonHelper.response(res, result.rows, 201, 
            "Register successful, please check your email");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed registering user");
    }
}

const resendVerificationEmail = async (req, res) => {
    try {
        const email = req.body.email
        const payload = {
            email
        }
        const token = authHelper.generateToken(payload);
        email.sendMail(data.email, token, "Example app email verification");

        commonHelper.response(res, null, 200,
            "Verification link has been sent, please check your email");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed sending verification email");
    }
}

const verifyUserEmail = async (req, res) => {
    try {
        let data = req.body;

        let decoded = jwt.verify(data.token, process.env.JWT_SECRETKEY);

        const emailResult = await userModel.findEmail(decoded.email);
        if (emailResult.rows[0].email_verified === true) return commonHelper
            .response(res, null, 403, "Email is already verified");

        const result = await userModel.verifyEmail(decoded.email);

        commonHelper.response(res, result.rows, 200,
            "Email verification successful");
    } catch (error) {
        console.log(error);
        switch (error.name) {
            case "JsonWebTokenError":
                commonHelper.response(res, null, 401, "Verification link invalid");
                break;
            case "TokenExpiredError":
                commonHelper.response(res, null, 401, "Verification link expired");
                break;
            default:
                commonHelper.response(res, null, 500, "Verification link not active");
                break;
        }
    }
}

const sendForgotPasswordLink = async (req, res) => {
    try {
        const data = req.body;

        const result = await userModel.findEmailVerified(data.email);
        if (!result.rowCount) return commonHelper
            .response(res, null, 403, "Email isn't verified");

        const payload = {
            email: data.email
        }
        const token = authHelper.generateToken(payload);
        email.sendForgotPassword(data.email, token, "Chatter app forgot password link");

        // Response
        commonHelper.response(res, result.rows, 200,
            "Forgot password link has been sent, please check your email");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed sending verification email");
    }
}

const resetUserPassword = async (req, res) => {
    try {
        // Get request data
        let data = req.body;

        // Check if requested data exists
        if (!data.token) return commonHelper.response(res, null, 400,
            "User must provide token");

        // Decode token
        let decoded = jwt.verify(data.token, process.env.JWT_SECRETKEY);

        // Check if email is verified
        const emailResult = await userModel.findEmailVerified(decoded.email);
        if (!emailResult.rowCount) return commonHelper
            .response(res, null, 403, "Email isn't verified");

        // Reset user password
        const salt = bcrypt.genSaltSync(10);
        data.password = bcrypt.hashSync(data.password, salt);
        const result = await userModel.updateUserPassword(decoded.email, data.password);

        // Response
        commonHelper.response(res, result.rows, 201,
            "Reset password successful");
    } catch (error) {
        console.log(error);
        switch (error.name) {
            case "JsonWebTokenError":
                commonHelper.response(res, null, 401, "Forgot password link invalid");
                break;
            case "TokenExpiredError":
                commonHelper.response(res, null, 401, "Forgot password link expired");
                break;
            default:
                commonHelper.response(res, null, 500, "Forgot password link not active");
                break;
        }
    }
}

const LoginUser = async (req, res) => {
    try {
        const data = req.body;

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username
        }
        user.token = authHelper.generateToken(payload);
        user.refreshToken = authHelper.generateRefreshToken(payload);

        commonHelper.response(res, user, 200, "Login is successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed login user");
    }
}

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRETKEY);

        let payload = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username
        };

        const result = {
            token: authHelper.generateToken(payload),
            refreshToken: authHelper.generateRefreshToken(payload),
        };

        //Response
        commonHelper.response(res, result, 200, "Success generating refresh token");
    } catch (error) {
        console.log(error);
        switch (error.name) {
            case "JsonWebTokenError":
                commonHelper.response(res, null, 401, "Token invalid");
                break;
            case "TokenExpiredError":
                commonHelper.response(res, null, 401, "Token expired");
                break;
            default:
                commonHelper.response(res, null, 500, "Token not active");
                break;
        }
    }
}

const getProfile = async (req, res) => {
    try {
        const id = req.payload.id;

        const result = await userModel.selectUser(id);

        commonHelper.response(res, result.rows, 200, "Get detail user successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting detail user");
    }
}

const getAllUsers = async (req, res) => {
    try {
        const searchParam = req.query.search || '';
        const sortBy = req.query.sortBy || 'updated_at';
        const sort = req.query.sort || 'desc';
        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const results = await userModel.selectAllUsers(searchParam, sortBy, sort, limit, offset);
        if (!results.rowCount) return commonHelper.response(res, null, 404, "Users not found");

        const totalData = results.rowCount;
        const totalPage = Math.ceil(totalData / limit);
        const pagination = { currentPage: page, limit, totalData, totalPage };
        if (page > totalPage) return commonHelper.response(res, null, 404, "Invalid page", pagination);

        commonHelper.response(res, results.rows, 200, "Get all users successful", pagination);
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting all users");
    }
}

const getDetailUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await userModel.selectUser(id);
        if (!result.rowCount) return commonHelper.response(res, null, 404, "User not found");
        commonHelper.response(res, result.rows, 200,"Get detail user successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting detail user");
    }
}

const updateUser = async (req, res) => {
    try {
        const id_user = req.payload.id;
        const data = req.body;

        // Update or insert user's image
        if (req.file && oldUserResult.rows[0].image !== null) {
            const oldImage = oldUserResult.rows[0].image;
            const oldImageId = oldImage.split("=")[1];
            const updateResult = await googleDrive.updateImage(req.file, oldImageId)
            const parentPath = process.env.GOOGLE_DRIVE_PHOTO_PATH;
            data.image = parentPath.concat(updateResult.id)
        } else if (req.file && oldUserResult.rows[0].image === null) {
            const uploadResult = await googleDrive.uploadImage(req.file)
            const parentPath = process.env.GOOGLE_DRIVE_PHOTO_PATH;
            data.image = parentPath.concat(uploadResult.id)
        }

        // Hash password if updated
        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            data.password = bcrypt.hashSync(data.password, salt);
        }

        if(data || req.file){
            data.id = id_user;
            data.updated_at = new Date(Date.now()).toISOString();
            await userModel.updateUser(data);
            const result = await userModel.selectUser(id_user)    
            commonHelper.response(res, result.rows, 201, "User updated");
        } else {
            commonHelper.response(res, null, 400, "User did not send any data to be updated");
        }
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed updating user");
    }
}

const deleteUser = async (req, res) => {
    try {
        const id_user = req.payload.id;

        const userResult = await userModel.selectUser(id_user);
        if (!userResult.rowCount) return commonHelper
            .response(res, null, 404, "User not found or already deleted");

        const oldPhoto = userResult.rows[0].image;
        if(oldPhoto != null){
            const oldPhotoId = oldPhoto.split("=")[1];
            await googleDrive.deleteImage(oldPhotoId);
        }

        const result = await userModel.deleteUser(id_user);

        commonHelper.response(res, result.rows, 200, "User deleted");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed deleting user");
    }
}

module.exports = {
    registerUser,
    resendVerificationEmail,
    verifyUserEmail,
    sendForgotPasswordLink,
    resetUserPassword,
    LoginUser,
    getProfile,
    refreshToken,
    getAllUsers,
    getDetailUser,
    updateUser,
    deleteUser,
}