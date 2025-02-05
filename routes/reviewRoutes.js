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
router.use(authController.protect);
router
  .route("/")
  .post(reviewsController.makeReview)
  .get(reviewsController.getAllReviews);

router
  .route("/:id")
  .get(reviewsController.getReview)
  .delete(
    authController.restrictTo("user", "admin"),
    reviewsController.deleteReview
  )
  .patch(
    authController.restrictTo("user", "admin"),
    reviewsController.updateReview
  );

module.exports = router;
