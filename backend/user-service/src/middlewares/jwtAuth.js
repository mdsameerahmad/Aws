const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from Authorization header, cookie, or X-Token-Fallback header (in that order of priority)
  let token = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(" ")[1];
    console.log('Using token from Authorization header');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('Using token from cookie');
  } else if (req.headers['x-token-fallback']) {
    token = req.headers['x-token-fallback'];
    console.log('Using token from X-Token-Fallback header');
  }

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize the user object to handle both userId and id formats
    req.user = {
      ...decoded,
      id: decoded.userId || decoded.id, // Ensure id is always available
    };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
