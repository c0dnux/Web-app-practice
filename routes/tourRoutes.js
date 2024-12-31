const express = require("express");
const tourController = require("./../controllers/tourcontroller");
const authController = require("./../controllers/authcontroller");
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

module.exports = router;
