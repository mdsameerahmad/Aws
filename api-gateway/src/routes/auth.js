const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const jwtAuth = require("../middlewares/jwtAuth");

//sameer changed
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const INCOME_SERVICE_URL = process.env.INCOME_SERVICE_URL;

// Add this for better error logging
router.use((req, res, next) => {
  console.log(`[API Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// Register
router.post("/register", async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/auth/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Login with standardized authentication
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/auth/login`, req.body);
    const token = response.data.token;
    
    // Log login attempt for debugging
    console.log(`User login attempt processed`);
    
    // Set cookie with appropriate options
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Required for HTTPS
      sameSite: "None", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/", // Ensure cookie is available across the entire site
    };

    // Set the cookie and return the token in the response
    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({ 
        message: "Logged in successfully", 
        token: token // Always include token in response for client-side storage
      });
  } catch (err) {
    console.error("User login error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Forgot Password - Fixed with enhanced logging
router.post("/forgot-password", async (req, res) => {
  console.log("API Gateway received /forgot-password request:", req.body);
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/auth/forgot-password`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("API Gateway error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});
//Reset Password

router.post("/reset-password", async (req, res) => {
  console.log("API Gateway received reset-password request:", req.body);
  try {
    const response = await axios.post(
      `${USER_SERVICE_URL}/api/auth/reset-password`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("API Gateway reset-password error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: "Service error" }
    );
  }
});

// Standardized Logout Route
router.post("/logout", (req, res) => {
  try {
    // Log logout attempt for debugging
    console.log(`User logout attempt processed`);
    
    // Clear the token from cookies with same settings as when it was set
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    });

    // Return success response
    res.status(200).json({ 
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/referral/validate/:code", async (req, res) => {
  try {
    const response = await axios.get(
      `${USER_SERVICE_URL}/api/referral/validate/${req.params.code}`
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: "Service error" }
    );
  }
});

// API Gateway
// api-gateway/routes/auth.js
router.get("/me", jwtAuth, async (req, res) => {
  try {
    // Get token from req.user which is set by jwtAuth middleware
    const token = req.user ? req.headers.authorization : null;
    
    const response = await axios.get(`${USER_SERVICE_URL}/api/auth/me`, {
      headers: {
        Authorization: token, // Forward token as Authorization header
      },
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Service error" });
  }
});

router.get("/leveltree-users", jwtAuth, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/auth/leveltree-users`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("API Gateway error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Standardized Check Auth Route
router.get("/check-auth", async (req, res) => {
  try {
    console.log(`Check auth attempt processed`);
    
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
      return res.json({ 
        authenticated: false
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Normalize the user object to handle both userId and id formats
      const normalizedUser = {
        ...decoded,
        id: decoded.userId || decoded.id, // Ensure id is always available
      };
      
      // Get user data from user service
      const response = await axios.get(`${USER_SERVICE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}` // Forward token as Authorization header
        },
      });
      
      // Always refresh the cookie to maintain session
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/"
      });
      
      return res.json({ 
        authenticated: true, 
        user: response.data
      });
    } catch (error) {
      console.error('Token verification failed:', error.message);
      // Invalid token
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
      });
      return res.json({ 
        authenticated: false,
        error: error.message
      });
    }
  } catch (error) {
    console.error("Check auth error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/change-password", jwtAuth, async (req, res) => {
  try {
    // Get token from req.user which is set by jwtAuth middleware
    const token = req.user ? req.headers.authorization : null;
    
    const response = await axios.put(`${USER_SERVICE_URL}/api/auth/change-password`, req.body, {
      headers: {
        Authorization: token, // Forward token as Authorization header
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

router.put("/profile", jwtAuth, async (req, res) => {
  try {
    // Get token from req.user which is set by jwtAuth middleware
    const token = req.user ? req.headers.authorization : null;
    
    const response = await axios.put(`${USER_SERVICE_URL}/api/auth/profile`, req.body, {
      headers: {
        Authorization: token, // Forward token as Authorization header
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

router.get("/income", jwtAuth, async (req, res) => {
  try {
    // Get token from req.user which is set by jwtAuth middleware
    const token = req.user ? req.headers.authorization : null;
    
    const response = await axios.get(`${INCOME_SERVICE_URL}/api/income`, {
      headers: {
        Authorization: token, // Forward token as Authorization header
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

module.exports = router;
