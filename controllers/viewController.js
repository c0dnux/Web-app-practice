const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModels");

exports.tourOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  if (!tours || tours.length === 0) {
    return res.status(404).json({ status: "fail", message: "No tours found" });
  }

  res.status(200).render("overview", {
    title: "All Tours",
    tours, // Send tours to the Pug template
  });
});
exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});
