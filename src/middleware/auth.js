const jwt = require("jsonwebtoken");
const commonHelper = require("../helper/common")

const protect = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
            req.payload = decoded;
            next();
        } else {
            return commonHelper.response(res, null, 401, 
                "Unauthorized, please provide a valid token");
        }
    } catch (error) {
        if (error && error.name === "JsonWebTokenError") {
            return commonHelper.response(res, null, 401, "Token invalid");
        } else if (error && error.name === "TokenExpiredError") {
            return commonHelper.response(res, null, 403, "Token expired");
        } else {
            return commonHelper.response(res, null, 403, "Token not active");
        }
    }
}

module.exports = { 
    protect
}