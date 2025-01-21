const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewsModel");
exports.makeReview = catchAsync(async (req, res, next) => {
  const review = Review.create(req.body);
});
