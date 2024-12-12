const express = require("express");
const tourController = require("./../controllers/tourcontroller");

const router = express.Router();


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
