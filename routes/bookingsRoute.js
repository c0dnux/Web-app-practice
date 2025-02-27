const express = require("express");
const authController = require("../controllers/authcontroller");
const bookingsController = require("../controllers/bookingsController");
const router = express.Router();
router.get(
  "/checkout-session/:tourId",
  authController.protect,
  bookingsController.getCheckoutSession
);
router.get(
  "/payment-success",
  authController.protect,
  bookingsController.paymentSuccess
);
module.exports = router;
