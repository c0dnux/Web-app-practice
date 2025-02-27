const express = require("express");
const router = express.Router();
const viewController = require(".././controllers/viewController");
const authController = require(".././controllers/authcontroller");

router.get("/me", authController.protect, viewController.getAccount);

router.use(authController.isLoggedIn);
router.get("/login", viewController.login);
router.get("/", viewController.tourOverview);
router.get("/tour/:slug", viewController.getTour);
router.get("/payment-success", viewController.paymentStatus);

module.exports = router;
