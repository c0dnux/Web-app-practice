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
