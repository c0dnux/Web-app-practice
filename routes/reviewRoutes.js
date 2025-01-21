const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const authController = require("../controllers/authcontroller");
router.route("/").post(authController.protect, reviewsController.makeReview);
module.exports = router;
