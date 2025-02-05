const express = require("express");
const tourController = require("./../controllers/tourcontroller");
const authController = require("./../controllers/authcontroller");
const reviewRoutes = require("./reviewRoutes");
const router = express.Router();

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
router.use("/:tourId/reviews", reviewRoutes);

router.route("/stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.writeTour
  );
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
