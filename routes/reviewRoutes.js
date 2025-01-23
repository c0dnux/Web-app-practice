const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const authController = require("../controllers/authcontroller");
router
  .route("/")
  .post(authController.protect, reviewsController.makeReview)
  .get(authController.protect, reviewsController.getAllReviews);
module.exports = router;
