const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const extractToken = (authorizationHeader) => {
  return authorizationHeader && authorizationHeader.split(' ')[1];
};

module.exports = {
  verifyToken,
  extractToken,
};
