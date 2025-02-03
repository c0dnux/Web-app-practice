const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewsController = require("../controllers/reviewsController");
const authController = require("../controllers/authcontroller");
//Post /tour/234fad4/reviews  //Create a review
//Get /tour/234fad4/reviews  //Get all reviews
//Get /tour/234fad4/reviews/234fad4   //Get a specific review
// router
//   .route("/:tourId/reviews")
//   .post(authController.protect, reviewsController.makeReview)
//   .get(authController.protect, reviewsController.getAllReviews);
// router
//   .route("/:tourId/reviews/:reviewId")
//   .get(authController.protect, reviewsController.getReview);

router
  .route("/")
  .post(authController.protect, reviewsController.makeReview)
  .get(authController.protect, reviewsController.getAllReviews)
  .patch(authController.protect, reviewsController.updateReview);

router
  .route("/:id")
  .get(authController.protect, reviewsController.getReview)
  .delete(authController.protect, reviewsController.deleteReview);
module.exports = router;
