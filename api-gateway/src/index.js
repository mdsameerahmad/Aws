const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const referralRoutes = require("./routes/referral");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const walletRoutes = require("./routes/wallet");
const incomeRoutes = require("./routes/income");
const purchaseRoutes = require("./routes/purchase");

const app = express();

// ✅ Force HTTPS + Redirect www → non-www
app.use((req, res, next) => {
  const host = req.headers.host;
  const proto = req.headers["x-forwarded-proto"];

  // Force HTTPS
  if (proto !== "https") {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  // Redirect www to non-www
  if (host && host.startsWith("www.")) {
    return res.redirect(301, `https://${host.slice(4)}${req.url}`);
  }

  next();
});

// ✅ Enhanced CORS middleware for cross-browser compatibility
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      const allowedOrigins = [
        process.env.CLIENT_URL,
        'https://growthaffinitymarketing.com',
        'https://www.growthaffinitymarketing.com',
        'https://growthaffinitymarketing.com',
        // Add more origins if needed
      ];
      
      if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With", 
      "Accept", 
      "Cache-Control",
      "Pragma",
      "Expires",
      "X-Forwarded-Proto",
      "X-Forwarded-For",
      "Origin"
    ],
    exposedHeaders: ["Access-Control-Allow-Origin", "Set-Cookie"],
    maxAge: 86400, // 24 hours - reduce preflight requests
  })
);

// ✅ Enhanced Preflight OPTIONS support (critical for Safari and iOS)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "https://growthaffinitymarketing.com",
      "https://www.growthaffinitymarketing.com",
      "https://growthaffinitymarketing.com",
      // Add more origins if needed
    ];

    const origin = req.headers.origin;
    if (origin && (allowedOrigins.some(allowed => origin.includes(allowed)) || !origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (!origin) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", 
      "Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma, Expires, X-Forwarded-Proto, X-Forwarded-For, Origin");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    
    // Safari/iOS specific headers - always apply these for OPTIONS requests
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    return res.sendStatus(204); // Safari needs this clean end
  }
  next();
});


// ✅ Enhanced credentials header support and browser-specific optimizations
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Check if the request is from Safari or iOS with improved detection
  const userAgent = req.headers['user-agent'] || '';
  const userAgentLower = userAgent.toLowerCase();
  const isSafari = /safari/.test(userAgentLower) && !/chrome/.test(userAgentLower);
  const isIOS = /iphone|ipad|ipod/.test(userAgentLower);
  
  if (isSafari || isIOS) {
    // Add Safari/iOS specific headers
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    
    // Log Safari/iOS requests for debugging
    console.log(`Safari/iOS request detected: ${req.method} ${req.path}`);
  }
  
  // Log all authentication-related requests for debugging
  if (req.path.includes('/login') || req.path.includes('/logout') || req.path.includes('/verify')) {
    console.log(`Auth request: ${req.method} ${req.path} from ${userAgent}`);
  }
  
  next();
});

app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/purchase", purchaseRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.API_GATEWAY_PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));






//--------------------------local Host pr chalane k liye-----------------------------------//



// const dotenv = require("dotenv");
// dotenv.config();

// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// const referralRoutes = require("./routes/referral");
// const authRoutes = require("./routes/auth");
// const adminRoutes = require("./routes/admin");
// const walletRoutes = require("./routes/wallet");
// const incomeRoutes = require("./routes/income");
// const purchaseRoutes = require("./routes/purchase");

// const app = express();

// // ✅ Force HTTPS + Redirect www → non-www, skip in dev/local
// app.use((req, res, next) => {
//   const host = req.headers.host;
//   const proto = req.headers["x-forwarded-proto"];

//   // ✅ Skip redirect for local development
//   if (
//     process.env.NODE_ENV === "development" ||
//     (host && host.includes("13.202.203.82"))
//   ) {
//     return next();
//   }

//   // ✅ Force HTTPS in production
//   if (proto !== "https") {
//     return res.redirect(301, `https://${host}${req.url}`);
//   }

//   // ✅ Redirect www to non-www
//   if (host && host.startsWith("www.")) {
//     return res.redirect(301, `https://${host.slice(4)}${req.url}`);
//   }

//   next();
// });

// // ✅ Enhanced CORS middleware
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       const allowedOrigins = [
//         process.env.CLIENT_URL,
//         "https://growthaffinitymarketing.com",
//         "https://www.growthaffinitymarketing.com",
//         "https://growthaffinitymarketing.com",
//         "http://localhost:3000"
//       ];

//       if (!origin || allowedOrigins.some((allowed) => origin.includes(allowed))) {
//         callback(null, true);
//       } else {
//         console.log("CORS blocked origin:", origin);
//         callback(null, false);
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "X-Requested-With",
//       "Accept",
//       "Cache-Control",
//       "Pragma",
//       "Expires",
//       "X-Forwarded-Proto",
//       "X-Forwarded-For",
//       "Origin",
//        "x-token-fallback" ,
//     ],
//     exposedHeaders: ["Access-Control-Allow-Origin", "Set-Cookie"],
//     maxAge: 86400,
//   })
// );

// // ✅ Preflight OPTIONS support
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//     const allowedOrigins = [
//       process.env.CLIENT_URL,
//       "https://growthaffinitymarketing.com",
//       "https://www.growthaffinitymarketing.com",
//       "https://growthaffinitymarketing.com",
//     ];

//     const origin = req.headers.origin;
//     if (origin && allowedOrigins.some((allowed) => origin.includes(allowed))) {
//       res.setHeader("Access-Control-Allow-Origin", origin);
//     } else if (!origin) {
//       res.setHeader("Access-Control-Allow-Origin", "*");
//     }

//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, OPTIONS, PATCH"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma, Expires, X-Forwarded-Proto, X-Forwarded-For, Origin"
//     );
//     res.setHeader("Access-Control-Max-Age", "86400");
//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");

//     return res.sendStatus(204);
//   }
//   next();
// });

// // ✅ Enhanced credentials and Safari/iOS tweaks
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Credentials", "true");

//   const userAgent = req.headers["user-agent"] || "";
//   const userAgentLower = userAgent.toLowerCase();
//   const isSafari = /safari/.test(userAgentLower) && !/chrome/.test(userAgentLower);
//   const isIOS = /iphone|ipad|ipod/.test(userAgentLower);

//   if (isSafari || isIOS) {
//     res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.header("Pragma", "no-cache");
//     res.header("Expires", "0");
//     console.log(`Safari/iOS request detected: ${req.method} ${req.path}`);
//   }

//   if (
//     req.path.includes("/login") ||
//     req.path.includes("/logout") ||
//     req.path.includes("/verify")
//   ) {
//     console.log(`Auth request: ${req.method} ${req.path} from ${userAgent}`);
//   }

//   next();
// });

// app.use(express.json());
// app.use(cookieParser());

// // ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/referral", referralRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/wallet", walletRoutes);
// app.use("/api/income", incomeRoutes);
// app.use("/api/purchase", purchaseRoutes);

// // ✅ Global error handler
// app.use((err, req, res, next) => {
//   console.error("ERROR:", err.message);
//   res.status(500).json({ error: err.message || "Internal Server Error" });
// });

// // ✅ Start server
// const PORT = process.env.API_GATEWAY_PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`🚀 API Gateway running on port ${PORT}`)
// );
