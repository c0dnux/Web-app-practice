const express = require("express");
const tourController = require("./../controllers/tourcontroller");

const router = express.Router();

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.writeTour);
router
  .route("/:id")
  .get(tourController.getTour)
  .put(tourController.updateTour)
  .delete(tourController.deletTour);

module.exports = router;
