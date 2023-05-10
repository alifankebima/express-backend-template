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
        // Get request user data
        const data = req.body;

        // Check if requested data exists
        if (!data.fullname || !data.username || !data.email || !data.password)
            return commonHelper.response(res, null, 400,
                "User must provide fullname, username, email, and password");

        // TODO: resend verification email if user is registered but not verified
        // Check if email is already used
        const emailResult = await userModel.findEmail(data.email);
        if (emailResult.rowCount) return commonHelper
            .response(res, null, 403, "Email is already used");

        // Check if username is already used
        const usernameResult = await userModel.findUsername(data.username);
        if (usernameResult.rowCount) return commonHelper
            .response(res, null, 403, "Username is already used");

        // Insert user to database
        data.id = uuidv4();
        data.email = data.email.toLowerCase();
        const salt = bcrypt.genSaltSync(10);
        data.password = bcrypt.hashSync(data.password, salt);
        data.created_at = new Date(Date.now()).toISOString();
        data.updated_at = data.created_at;
        const result = await userModel.insertUser(data);

        // Send email verification link
        const payload = {
            email: data.email
        }
        const token = authHelper.generateToken(payload);
        email.sendMail(data.email, token, "Chatter app email verification");

        // Response
        commonHelper.response(res, result.rows, 201,
            "Register successful, please check your email");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed registering user");
    }
}

const resendVerificationEmail = async (req, res) => {
    try {
        // Get request data
        const data = req.body;

        // Check if requested data exists
        if (!data.email) return commonHelper.response(res, null, 400,
            "User must provide email");

        // Check if email is already verified
        const result = await userModel.findEmailVerified(data.email);
        if (result.rowCount) return commonHelper
            .response(res, null, 403, "Email is already verified");

        // Resend email verification link
        const payload = {
            email: data.email
        }
        const token = authHelper.generateToken(payload);
        email.sendMail(data.email, token, "Chatter app email verification");

        // Response
        commonHelper.response(res, result.rows, 200,
            "Verification link has been sent, please check your email");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed sending verification email");
    }
}

const verifyUserEmail = async (req, res) => {
    try {
        // Get request data
        let data = req.body;

        // Check if requested data exists
        if (!data.token) return commonHelper.response(res, null, 400,
            "User must provide token");

        // Decode token
        let decoded = jwt.verify(data.token, process.env.JWT_SECRETKEY);

        // Check if email is already verified
        const emailResult = await userModel.findEmailVerified(decoded.email);
        if (emailResult.rowCount) return commonHelper
            .response(res, null, 403, "Email is already verified");

        // Verify email
        const result = await userModel.verifyEmail(decoded.email);

        // Response
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
        // Get request data
        const data = req.body;
        console.log(data)
        // Check if requested data exists
        if (!data.email) return commonHelper.response(res, null, 400,
            "User must provide email");

        // Check if email is verified
        const result = await userModel.findEmailVerified(data.email);
        if (!result.rowCount) return commonHelper
            .response(res, null, 403, "Email isn't verified");

        // Resend email verification link
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
        // Get request login information
        const data = req.body;

        // Check if requested data exists
        if (!data.email || !data.password) return commonHelper
            .response(res, null, 400, "User must provide email and password");

        // Check if email exists
        const { rows: [user], rowCount } = await userModel.findEmail(data.email);
        if (!rowCount) return commonHelper
            .response(res, null, 403, "Email is invalid");

        // Check if password is valid
        const isValidPassword = bcrypt.compareSync(data.password, user.password);
        if (!isValidPassword) return commonHelper
            .response(res, null, 403, "Password is invalid");

        // Check if user's email is verified
        if (!user.email_verified) return commonHelper
            .response(res, null, 403, "Email is not verified");

        // Generate payload
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username
        }
        user.token = authHelper.generateToken(payload);
        user.refreshToken = authHelper.generateRefreshToken(payload);

        // Response
        delete user.password;
        commonHelper.response(res, user, 200, "Login is successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed login user");
    }
}

const refreshToken = async (req, res) => {
    try {
        //Get request refresh token
        const refreshToken = req.body.refreshToken;

        //Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRETKEY);

        //Token payload
        let payload = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username
        };

        //New refreshed token
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
        // Get request user id
        const id = req.payload.id;

        // Get user by id from database
        const result = await userModel.selectUser(id);

        // Response
        commonHelper.response(res, result.rows, 200,
            "Get detail user successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting detail user");
    }
}

const getAllUsers = async (req, res) => {
    try {
        // Search and pagination query
        const searchParam = req.query.search || '';
        const sortBy = req.query.sortBy || 'updated_at';
        const sort = req.query.sort || 'desc';
        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // Get all users from database
        const results = await userModel
            .selectAllUsers(searchParam, sortBy, sort, limit, offset);

        // Return not found if there's no user in database
        if (!results.rowCount) return commonHelper
            .response(res, null, 404, "Users not found");

        // Pagination info
        const totalData = results.rowCount;
        const totalPage = Math.ceil(totalData / limit);
        const pagination = { currentPage: page, limit, totalData, totalPage };

        // Return page invalid if page params is more than total page
        if (page > totalPage) return commonHelper
            .response(res, null, 404, "Page invalid", pagination);

        // Response
        commonHelper.response(res, results.rows, 200,
            "Get all users successful", pagination);
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting all users");
    }
}

const getDetailUser = async (req, res) => {
    try {
        // Get request user id
        const id = req.params.id;

        // Get user by id from database
        const result = await userModel.selectUser(id);

        // Return not found if there's no user in database
        if (!result.rowCount) return commonHelper
            .response(res, null, 404, "User not found");

        // Response
        commonHelper.response(res, result.rows, 200,
            "Get detail user successful");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed getting detail user");
    }
}

const updateUser = async (req, res) => {
    try {
        // Get request user id and user data
        const id_user = req.payload.id;
        const data = req.body;

        // Get old user data
        const oldUserResult = await userModel.selectUser(id_user);

        // Check if user exists
        if (!oldUserResult.rowCount) return commonHelper
            .response(res, null, 404, "User not found");

        // Update image if image already exists in database
        if (req.file && oldUserResult.rows[0].image != "") {
            const oldImage = oldUserResult.rows[0].image;
            const oldImageId = oldImage.split("=")[1];
            const updateResult = await googleDrive.updateImage(req.file, oldImageId)
            const parentPath = process.env.GOOGLE_DRIVE_PHOTO_PATH;
            data.image = parentPath.concat(updateResult.id)

            // Upload image if image doesn't exists in database
        } else if (req.file && oldUserResult.rows[0].image == "") {
            const uploadResult = await googleDrive.uploadImage(req.file)
            const parentPath = process.env.GOOGLE_DRIVE_PHOTO_PATH;
            data.image = parentPath.concat(uploadResult.id)
        }

        // Hash password if updated
        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            data.password = bcrypt.hashSync(data.password, salt);
        }

        // Update user in database
        data.id = id_user;
        data.updated_at = new Date(Date.now()).toISOString();
        await userModel.updateUser(data);

        // Get user data after update
        const result2 = await userModel.selectUser(id_user)

        // Response
        commonHelper.response(res, result2.rows, 201, "User updated");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed updating user");
    }
}

const deleteUser = async (req, res) => {
    try {
        // Get request user id
        const id_user = req.payload.id;

        // Check if user exists in database
        const userResult = await userModel.selectUser(id_user);
        if (!userResult.rowCount) return commonHelper
            .response(res, null, 404, "User not found or already deleted");

        // Delete user's image
        const oldPhoto = userResult.rows[0].image;
        if(oldPhoto != null){
            const oldPhotoId = oldPhoto.split("=")[1];
            await googleDrive.deleteImage(oldPhotoId);
        }

        // Delete user
        const result = await userModel.deleteUser(id_user);

        // Response
        commonHelper.response(res, result.rows, 200, "User deleted");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed deleting user");
    }
}

const deleteProfilePicture = async (req, res) => {
    try {
        // Get request user id
        const id_user = req.payload.id;

        // Check if user exists in database
        const userResult = await userModel.selectUser(id_user);
        if (!userResult.rowCount) return commonHelper
            .response(res, null, 404, "User not found or already deleted");

        // Delete user's image
        const oldPhoto = userResult.rows[0].image;
        if(oldPhoto != null){
            const oldPhotoId = oldPhoto.split("=")[1];
            await googleDrive.deleteImage(oldPhotoId);
            await userModel.deleteProfilePicture(id_user)
        }

        // Response
        commonHelper.response(res, null, 200, "Profile picture deleted");
    } catch (error) {
        console.log(error);
        commonHelper.response(res, null, 500, "Failed deleting rofile picture");
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
    deleteProfilePicture
}