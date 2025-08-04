const express = require("express");
const router = express.Router();

const {
  requestProduct,
  approvePurchase,
  rejectPurchase,
  getMyPurchases,
  getPendingPurchasesByUser,
  getApprovedPurchasesByUser
} = require("../controllers/purchaseController");

const { isAuthenticated, isAdmin, extractUser } = require("../middlewares/auth");
const { cacheMiddleware } = require("../middlewares/cacheMiddleware");

router.use(extractUser);

// ✅ USER ROUTES
router.post("/request" ,isAuthenticated, requestProduct);
router.get("/my-purchases", isAuthenticated, getMyPurchases);

// ✅ ADMIN ROUTES
router.get("/admin/user/:userId/pending-purchases", isAuthenticated, isAdmin, getPendingPurchasesByUser);
router.get("/admin/user/:userId/approved-purchases", isAuthenticated, isAdmin, getApprovedPurchasesByUser);
router.put("/admin/:purchaseId/approve", isAuthenticated, isAdmin, approvePurchase);
router.put("/admin/:purchaseId/reject", isAuthenticated, isAdmin, rejectPurchase);

module.exports = router;
