const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  //Get token from header
  const token = req.header("auth-token");

  //Check client fill auth-token yet!
  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied, pls fill auth-token" });

  try {
    // Get id user from token and call middleware next()
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
}

module.exports = verifyToken;
