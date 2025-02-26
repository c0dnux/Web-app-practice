const express = require("express");
const authController = require("../controllers/authcontroller");
const bookingsController = require("../controllers/bookingsController");
const router = express.Router();
router.get("/checkout-session", authController.protect);
module.exports = router;
