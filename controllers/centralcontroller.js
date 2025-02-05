const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.deleteOne({ _id: id });
    if (doc.deletedCount === 0) {
      return next(new AppError("No document with this id found", 404));
    }

    res.status(204).json({ status: "success", data: null });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      next(new AppError("No document found", 404));
    }
    res.status(200).json({ status: "Success", data: doc });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // let filter = {};
    // // const tourRef = req.params.tourId;
    // if (req.params.tourId) filter = { tourRef: req.params.tourId };
    const reviews = await Model.find({ tourRef: req.params.tourId });

    res
      .status(200)
      .json({ status: "Success", count: reviews.length, data: { reviews } });
  });
