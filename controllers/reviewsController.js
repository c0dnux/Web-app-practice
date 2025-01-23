const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewsModel");
exports.makeReview = catchAsync(async (req, res, next) => {
  const { ...data } = req.body;
  data.userRef = req.user._id;
  const review = await Review.create(data);

  res.status(201).json({ status: "Success", data: { review } });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res
    .status(200)
    .json({ status: "Success", count: reviews.length, data: { reviews } });
});
