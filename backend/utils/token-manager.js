const jwt = require("jsonwebtoken");
const { COOKIE_NAME } = require("../utils/constrants");

const createToken = (id, email, role, expiresIn = "7d") => {
  const payload = { id, email, role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (req, res, next) => {
  // Check for token in cookies first
  let token = req.signedCookies[COOKIE_NAME];
  
  // If not in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err);
    return res.status(403).json({ message: "Token verification failed", error: err.message });
  }
};

module.exports = {
  createToken,
  verifyToken,
};