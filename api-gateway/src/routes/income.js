// routes/income.js
const express = require("express");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");
dotenv = require("dotenv");
dotenv.config();

const INCOME_SERVICE_URL = process.env.INCOME_SERVICE_URL ;

// ✅ Remove "/api/income" here and just use "/"
router.use(
  "/",
  createProxyMiddleware({
    target: INCOME_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/income": "", // ✅ remove /api/income before sending to income-service
    },
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.cookie) {
        proxyReq.setHeader("Cookie", req.headers.cookie);
      }
    },
  })
);

module.exports = router;
