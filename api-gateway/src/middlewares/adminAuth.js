const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Log user agent for debugging
  const userAgent = req.headers['user-agent'] || '';
  const isSafari = /safari/.test(userAgent.toLowerCase()) && !/chrome/.test(userAgent.toLowerCase());
  const isIOS = /iphone|ipad|ipod/.test(userAgent.toLowerCase());
  
  // Check for token in cookies or Authorization header
  let token = req.cookies.adminToken;
  
  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Using token from Authorization header instead of cookie');
  }

  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized, no token',
      userAgent: userAgent,
      isSafari: isSafari || isIOS
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) throw new Error("Not an admin");
    req.admin = decoded;
    
    // For Safari/iOS, refresh the cookie with each successful auth
    if ((isSafari || isIOS) && token) {
      console.log('Safari/iOS detected in adminAuth, refreshing admin token cookie');
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Add cache control headers for Safari
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error.message);
    res.status(401).json({ 
      message: 'Not authorized, token failed',
      userAgent: userAgent,
      isSafari: isSafari || isIOS
    });
  }
};