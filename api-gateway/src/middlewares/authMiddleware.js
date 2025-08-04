const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Just decode, do NOT fetch user from DB here
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id, // Handle both userId and id formats
      isAdmin: decoded.isAdmin || false, // assuming this is included in token payload
    };

    next();
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = protect;
