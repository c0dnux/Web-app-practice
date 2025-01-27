const express = require("express");
const tourController = require("./../controllers/tourcontroller");
const authController = require("./../controllers/authcontroller");
const reviewsController = require("../controllers/reviewsController");

const router = express.Router();
router.route("/stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.writeTour);
router
  .route("/:id")
  .get(tourController.getTour)
  .put(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deletTour
  );
//Post /tour/234fad4/reviews  //Create a review
//Get /tour/234fad4/reviews  //Get all reviews
//Get /tour/234fad4/reviews/234fad4   //Get a specific review
router
  .route("/:tourId/reviews")
  .post(authController.protect, reviewsController.makeReview)
  .get(authController.protect, reviewsController.getAllReviews);
router
  .route("/:tourId/reviews/:reviewId")
  .get(authController.protect, reviewsController.getReview);
module.exports = router;
