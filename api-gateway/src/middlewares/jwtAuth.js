const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log(`JWT Auth middleware processing request`);
  
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
    console.log('No token found');
    return res.status(401).json({ 
      error: "Token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize the user object to handle both userId and id formats
    req.user = {
      ...decoded,
      id: decoded.userId || decoded.id, // Ensure id is always available
    };
    
    // Set the Authorization header for downstream services
    req.headers.authorization = `Bearer ${token}`;
    
    // Always refresh the cookie to maintain session
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/"
    });
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(403).json({ 
      message: "Invalid or expired token"
    });
  }
};
