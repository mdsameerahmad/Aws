const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const referralRoutes = require("./routes/referral");
const walletRoutes = require("./routes/wallet");
const incomeRoutes = require("./routes/income");
const purchaseRoutes = require("./routes/purchase");

const app = express();

// -----------------------------
// CORS FIX (100% Guaranteed)
// -----------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://growthaffinitymarketing.com",
  "https://www.growthaffinitymarketing.com",
  "http://localhost:3000"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  // Important: Stop OPTIONS here
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Body & cookies
app.use(express.json());
app.use(cookieParser());

// -----------------------------
// Routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/purchase", purchaseRoutes);

// -----------------------------
// Global error handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// -----------------------------
// Server
// -----------------------------
const PORT = process.env.API_GATEWAY_PORT || 5000;
app.listen(PORT, () => console.log("🚀 API Gateway running on", PORT));
