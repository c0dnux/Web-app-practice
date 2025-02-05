const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewsModel");
const AppErr = require("../utils/appError");
const centralController = require("./centralcontroller");
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

  // await Review.calcAverageRatings(req.params.tourId);

  res.status(201).json({ status: "Success", data: { review } });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // let filter = {};
  // // const tourRef = req.params.tourId;
  // if (req.params.tourId) filter = { tourRef: req.params.tourId };
  const reviews = await Review.find({ tourRef: req.params.tourId });

  res
    .status(200)
    .json({ status: "Success", count: reviews.length, data: { reviews } });
});
exports.getReview = catchAsync(async (req, res, next) => {
  const { tourId, id } = req.params;

  const review = await Review.findOne({ _id: id, tourRef: tourId });
  if (!review) {
    return next(
      new AppErr("No review found with the given ID and tour reference.", 404)
    );
  }

  res.status(200).json({ status: "Success", data: { review } });
});
// exports.updateReview = centralController.updateOne(Review);
exports.updateReview = catchAsync(async (req, res, next) => {
  const allowedFields = ["review", "rating"];
  const updates = {};
  allowedFields.forEach((el) => {
    if (req.body[el]) updates[el] = req.body[el];
  });
  const updated = await Review.findOneAndUpdate(
    { userRef: req.user._id, tourRef: req.params.tourId },
    updates,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updated) {
    return next(new AppErr("No review found with this reference.", 404));
  }
  // await Review.calcAverageRatings(updated.tourRef);

  res.status(200).json({ status: "Success", data: { updated } });
});

// exports.deleteReview = centralController.deleteOne(Review);
exports.deleteReview = catchAsync(async (req, res, next) => {
  const deleted = await Review.findOneAndDelete({
    userRef: req.user._id,
    tourRef: req.params.tourId,
  });

  if (!deleted)
    return next(
      new AppErr("You cannot delete a review that does not exist.", 404)
    );

  // await Review.calcAverageRatings(deleted.tourId);

  res.status(204).json({ status: "Success", data: null });
});
