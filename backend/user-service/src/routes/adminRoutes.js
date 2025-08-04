const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminUserController");
const wrapAsync = require("../utils/wrapAsync");
const { cacheMiddleware } = require("../middlewares/cache");

router.get("/users",  wrapAsync(controller.getAllUsers));
router.get("/user/:id", wrapAsync(controller.getSingleUser));
router.delete("/delete-user/:id", wrapAsync(controller.adminDeleteUser));


module.exports = router;
