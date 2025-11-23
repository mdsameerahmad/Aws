// src/index.js

require("dotenv").config();

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

// --------------------------------------------------
// 1) Basic setup
// --------------------------------------------------
const PORT = process.env.API_GATEWAY_PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProd = NODE_ENV === "production";

// Behind nginx / load balancer → trust proxy
app.set("trust proxy", 1);

// --------------------------------------------------
// 2) CORS setup (works for local + prod)
// --------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,                     // e.g. https://growthaffinitymarketing.com
  "https://growthaffinitymarketing.com",
  "https://www.growthaffinitymarketing.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser / tools / curl (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked origin:", origin);
    return callback(null, false);
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
    "Origin",
    "x-token-fallback",
  ],
  exposedHeaders: ["Set-Cookie", "Access-Control-Allow-Origin"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Let CORS handle OPTIONS for all routes
app.options("*", cors(corsOptions));

// --------------------------------------------------
// 3) Preflight / cache headers (extra-safe for Safari / iOS)
// --------------------------------------------------
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    if (!origin) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma, Expires, X-Forwarded-Proto, X-Forwarded-For, Origin, x-token-fallback"
    );
    res.setHeader("Access-Control-Max-Age", "86400"); // 24h
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.sendStatus(204);
  }

  next();
});

// --------------------------------------------------
// 4) Global headers for credentials + Safari/iOS tweaks
// --------------------------------------------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isSafari = userAgent.includes("safari") && !userAgent.includes("chrome");
  const isIOS = /iphone|ipad|ipod/.test(userAgent);

  if (isSafari || isIOS) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    console.log(`Safari/iOS request: ${req.method} ${req.path}`);
  }

  if (
    req.path.includes("/login") ||
    req.path.includes("/logout") ||
    req.path.includes("/verify")
  ) {
    console.log(`Auth request: ${req.method} ${req.path} from UA: ${userAgent}`);
  }

  next();
});

// --------------------------------------------------
// 5) Force HTTPS + non-www (PRODUCTION ONLY)
// --------------------------------------------------
//
// ❗ IMPORTANT:
// - We SKIP this in development / local
// - We SKIP for OPTIONS (CORS preflight)
// - We SKIP for ACME challenge (Certbot)
// --------------------------------------------------
app.use((req, res, next) => {
  if (!isProd) return next();                // no redirect in dev/local
  if (req.method === "OPTIONS") return next(); // don't ever redirect preflight
  if (req.path.startsWith("/.well-known/")) return next(); // let Certbot pass

  const host = req.headers.host;
  const proto =
    req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");

  // Force HTTPS
  if (proto !== "https") {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  // Redirect www → non-www
  if (host && host.startsWith("www.")) {
    const bareHost = host.slice(4);
    return res.redirect(301, `https://${bareHost}${req.originalUrl}`);
  }

  next();
});

// --------------------------------------------------
// 6) Core middlewares
// --------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------
// 7) Routes
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/purchase", purchaseRoutes);

// --------------------------------------------------
// 8) Global error handler
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  if (res.headersSent) return next(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// --------------------------------------------------
// 9) Start server
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(
    `🚀 API Gateway running on port ${PORT} in ${NODE_ENV.toUpperCase()} mode`
  );
});
