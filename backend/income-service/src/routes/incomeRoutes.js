// src/routes/incomeRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/incomeController");
const { cacheMiddleware } = require("../middlewares/cache");

// This route is called from wallet-service after topup approval
// No authentication required as it's an internal service-to-service call
router.post("/topup-trigger", controller.handleTopupTrigger);

module.exports = router;
