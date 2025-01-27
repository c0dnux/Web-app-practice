const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewsModel");
const AppErr = require("../utils/appError");

exports.makeReview = catchAsync(async (req, res, next) => {
  const existingReview = await Review.findOne({
    userRef: req.user._id,
    tourRef: req.params.tourId,
  });


  if (existingReview) {
    return next(new AppErr("You have made a review", 400));
  }

  const data = {
    ...req.body,
    userRef: req.user._id,
    tourRef: req.params.tourId,
  };

  // console.log(data);

  // const { ...data } = req.body;
  // data.userRef = req.user._id;
  // data.tourRef = req.params.tourId;
  const review = await Review.create(data);

  await Review.calcAverageRatings(req.params.tourId);

  res.status(201).json({ status: "Success", data: { review } });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const tourRef = req.params.tourId;

  const reviews = await Review.find({ tourRef });

  res
    .status(200)
    .json({ status: "Success", count: reviews.length, data: { reviews } });
});
exports.getReview = catchAsync(async (req, res, next) => {
  const { tourId, reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId, tourRef: tourId });

  res.status(200).json({ status: "Success", data: { review } });
});
