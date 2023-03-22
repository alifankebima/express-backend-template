const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const verifyOpts = {
    expiresIn: "1h",
    issuer: "example",
  };
  const token = jwt.sign(payload, process.env.JWT_SECRETKEY, verifyOpts);
  return token;
};

const generateRefreshToken = (payload) => {
  const verifyOpts = { expiresIn: "1 day" };
  const token = jwt.sign(payload, process.env.JWT_SECRETKEY, verifyOpts);
  return token;
};

module.exports = { generateToken, generateRefreshToken };
