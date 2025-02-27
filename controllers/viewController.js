const catchAsync = require(".././utils/catchAsync");
const Tour = require(".././models/tourModels");
const AppError = require(".././utils/appError");

exports.tourOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find().lean();
  if (!tours || tours.length === 0) {
    return next(new AppError("No tours found", 404)); // 🔥 Let error middleware handle it
  }

  res.status(200).render("overview", {
    title: "All Tours",
    tours, // Send tours to the Pug template
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    select: "review rating user",
  });

  if (!tour) {
    return next(new AppError("No tour found with that name", 404));
  }

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Login",
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
});
exports.paymentStatus = catchAsync(async (req, res, next) => {
  res.status(200).render("payment-status", {
    title: "Payment Status",
  });
});