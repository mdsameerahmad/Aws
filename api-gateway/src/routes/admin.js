const express = require("express");
const router = express.Router();
const axios = require("axios");
dotenv = require("dotenv");
dotenv.config();

const adminAuth = require('../middlewares/adminAuth');
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

//sameer
router.get("/verify", async (req, res) => {
  try {
    // Log user agent for debugging
    const userAgent = req.headers['user-agent'] || '';
    console.log(`Admin verify attempt from: ${userAgent}`);
    
    // Detect Safari/iOS
    const isSafari = /safari/.test(userAgent.toLowerCase()) && !/chrome/.test(userAgent.toLowerCase());
    const isIOS = /iphone|ipad|ipod/.test(userAgent.toLowerCase());
    
    // Add special handling for Safari/iOS
    if (isSafari || isIOS) {
      console.log('Safari/iOS detected, applying special headers for admin verify');
      // Safari/iOS may need these headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    // Check for token in cookies or Authorization header
    let token = req.cookies.adminToken;
    
    // If no token in cookies, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Using token from Authorization header instead of cookie');
    }
    
    if (!token) {
      return res.status(401).json({ 
        message: "No token available to forward",
        userAgent: userAgent,
        isSafari: isSafari || isIOS
      });
    }

    const response = await axios.get(`${ADMIN_SERVICE_URL}/api/admin/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': userAgent, // Forward user agent for consistent handling
      },
      withCredentials: true
    });

    // For Safari/iOS, set the cookie again to refresh it
    if ((isSafari || isIOS) && token) {
      console.log('Safari/iOS detected, refreshing admin token cookie');
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    res.status(response.status).json({
      ...response.data,
      userAgent: userAgent, // Include user agent for debugging
      isSafari: isSafari || isIOS
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err?.response?.data || err.message);
    
    // If verification fails, clear the cookie with proper settings
    if (err.response?.status === 401) {
      res.clearCookie("adminToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
      });
    }
    
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Service error" }
    );
  }
});




// Admin Login with enhanced cross-browser compatibility
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${ADMIN_SERVICE_URL}/api/admin/login`, req.body);

    const token = response.data.token;
    
    // Log user agent for debugging
    const userAgent = req.headers['user-agent'] || '';
    console.log(`Admin login attempt from: ${userAgent}`);
    
    // Detect Safari/iOS
    const isSafari = /safari/.test(userAgent.toLowerCase()) && !/chrome/.test(userAgent.toLowerCase());
    const isIOS = /iphone|ipad|ipod/.test(userAgent.toLowerCase());
    
    // Set cookie with appropriate options
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Required for HTTPS
      sameSite: "None", // Required for cross-site cookies
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    
    // Add special handling for Safari/iOS
    if (isSafari || isIOS) {
      console.log('Safari/iOS detected, applying special cookie handling for admin');
      // Safari/iOS may need these headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Set cookie with enhanced cross-browser compatibility
    res
      .cookie("adminToken", token, cookieOptions)
      .status(200)
      .json({ 
        message: "Admin logged in successfully",
        token: token, // Always include token in response for localStorage
        userAgent: userAgent // Include user agent for debugging
      });
  } catch (err) {
    console.error("Admin login error:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Service error" });
  }
});



// 🔁 Change Admin Password
router.put("/change-password", adminAuth, async (req, res) => {
  try {
    const response = await axios.put(`${ADMIN_SERVICE_URL}/api/admin/change-password`, req.body, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// ✅ Get Admin Profile (for dashboard)
// router.get("/me", adminAuth, async (req, res) => {
//   try {
//     const response = await axios.get(`${ADMIN_SERVICE_URL}/api/admin/me`, {
//       headers: {
//         Authorization: req.headers.authorization, // forward token to admin-service
//       },
//     });

//     res.status(response.status).json(response.data);
//   } catch (err) {
//     res.status(err.response?.status || 500).json(
//       err.response?.data || { message: "Service error" }
//     );
//   }
// });

router.get("/profile", adminAuth, async (req, res) => {
  try {
    const response = await axios.get(`${ADMIN_SERVICE_URL}/api/admin/me`, {
      headers: {
        Authorization: req.headers.authorization, // forward token to admin-service
      },
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Service error" }
    );
  }
});


// 📋 Get All Users (admin dashboard)
router.get("/users", adminAuth, async (req, res) => {
  try {
    if (!ADMIN_SERVICE_URL) {
      return res.status(500).json({ message: "Admin service URL not configured" });
    }

    const response = await axios.get(`${ADMIN_SERVICE_URL}/api/admin/users`, {
      headers: { 
        Authorization: req.headers.authorization
      }
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { 
        message: "Service error",
        detail: err.message
      }
    );
  }
});

// 👤 Get Single User by ID via User-Service
router.get("/user/:id", adminAuth, async (req, res) => {
  try {
    const response = await axios.get(
      `${USER_SERVICE_URL}/api/admin/user/${req.params.id}`,
      {
        headers: {
          Authorization: req.headers.authorization
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Service error", detail: err.message }
    );
  }
});

router.delete("/delete-user/:id",adminAuth, async (req, res) => {
  try {
    const response = await axios.delete(`${USER_SERVICE_URL}/api/admin/delete-user/${req.params.id}`, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Failed to delete user" });
  }
});

router.post("/logout", (req, res) => {
  try {
    // Log user agent for debugging
    const userAgent = req.headers['user-agent'] || '';
    console.log(`Admin logout attempt from: ${userAgent}`);
    
    // Detect Safari/iOS
    const isSafari = /safari/.test(userAgent.toLowerCase()) && !/chrome/.test(userAgent.toLowerCase());
    const isIOS = /iphone|ipad|ipod/.test(userAgent.toLowerCase());
    
    // Clear the cookie with same settings as when it was set
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    });
    
    // Add special handling for Safari/iOS
    if (isSafari || isIOS) {
      console.log('Safari/iOS detected, applying special headers for admin logout');
      // Safari/iOS may need these headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    res.status(200).json({ 
      message: "Admin logged out successfully",
      userAgent: userAgent // Include user agent for debugging
    });
  } catch (err) {
    console.error("Admin logout error:", err.message);
    res.status(500).json({ message: "Logout error", error: err.message });
  }
});



module.exports = router;
