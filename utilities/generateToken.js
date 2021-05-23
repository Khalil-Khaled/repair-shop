const jwt = require("jsonwebtoken");
module.exports = async function generateToken(userID, expire) {
  const payload = {
    id: userID,
  };
  // Sign Token
  const token = await jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: expire,
  });
  return token;
};
