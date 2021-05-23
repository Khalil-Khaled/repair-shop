const jwt = require("jsonwebtoken");

function clearTokenAndNext() {
  res.clearCookie("token");
  next();
}

module.exports = function (req, res, next) {
  try {
    req.user = null;

    var { token } = req.cookies;
    if (!token) {
      clearTokenAndNext();
      return res.json({error: "Access Denied, please login"} ); //if there is no token
    }

    const verified = jwt.verify(token, process.env.JWT_KEY);
    req.user = verified;
    next();
  } catch (err) {
    return res.json({ error: "Access Denied, please login" });
  }
};
