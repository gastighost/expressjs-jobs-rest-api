require("dotenv").config();
const jwt = require("jsonwebtoken");
const createError = require("../utils/custom-error");

const auth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(createError("Token must be provided", 401));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(createError("Token must be provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.data;
    next();
  } catch (error) {
    next(createError("Session is expired or invalid", 401));
  }
};

module.exports = auth;
