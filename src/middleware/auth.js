const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const commonHelper = require("../helper/common")

const verifyToken = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
      let decoded = await jwt.verify(token, process.env.SECRET_KEY_JWT);
      req.payload = decoded;
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized, Please provide valid token",
      });
    }
  } catch (error) {
    if (error && error.name === "JsonWebTokenError") {
      return next(new createError(401, "Token invalid"));
    } else if (error && error.name === "TokenExpiredError") {
      return next(new createError(401, "Token expired"));
    } else {
      return next(new createError(401, "Token not active"));
    }
  }
};

//Ensures id_user or id_admin in payload (login auth token)
//Is the same compared to id_user or id_admin in params
//This prevents user modifying data created by other user
const isIdValid = (req, res, next) => {
  const payload = req.payload;
  const queryId = req.params.id_admin || req.params.id_user;
  if (payload) {
    if (payload.id == queryId) {
      next();
    } else {
      commonHelper.response(res, null, 403,
        "Modifying data created by other user is not allowed");
    }
  } else {
    commonHelper.response(res, null, 403, "User not found");
  }
};

//Checks if role in payload (login auth token) is admin
const isAdmin = (req, res, next) => {
  const payload = req.payload;
  if (payload) {
    if (payload.role === "admin") {
      next();
    } else {
      commonHelper.response(res, null, 403,
        "Unauthorized, please login as admin");
    }
  } else {
    commonHelper.response(res, null, 403, "User not found");
  }
};

//Checks if role in payload (login auth token) is user
const isUser = (req, res, next) => {
  const payload = req.payload;
  if (payload) {
    if (payload.role === "user") {
      next();
    } else {
      commonHelper.response(res, null, 403,
        "Unauthorized, please login as user");
    }
  } else {
    commonHelper.response(res, null, 403, "User not found");
  }
};


module.exports = { verifyToken, isIdValid, isAdmin, isUser };