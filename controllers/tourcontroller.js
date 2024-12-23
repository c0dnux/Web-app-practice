const Tour = require("./../models/tourModels");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
//Alias Middle WAre
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,ratingAverage";
  req.query.fields = "name,price,maxGroupSize";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //Filtering
  // const queryObj = { ...req.query };
  // const delObj = ["page", "sort", "limit", "fields"];

  // delObj.forEach((el) => {
  //   delete queryObj[el];
  // });
  // //Advanced Filtering
  // let queryString = JSON.stringify(queryObj);
  // queryString = queryString.replace(
  //   /\b(gte|gt|lt|lte)\b/g,
  //   (match) => `$${match}`
  // );

  // let query = Tour.find(JSON.parse(queryString));

  //Sorting
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  // }
  //Field Limiting
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(",").join(" ");
  //   query = query.select(fields);
  // }

  //Pagination
  // const page = Number(req.query.page) || 1;
  // const limit = Number(req.query.limit) || 50;
  // const skip = page * limit - limit;
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numOfTours = await Tour.countDocuments();
  //   if (skip >= numOfTours) throw new Error("This doesnot exist");
  // }
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limiting()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: tours,
  });
});

exports.writeTour = catchAsync(async (req, res) => {
  const dbRes = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: dbRes,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError(`No user with this id found`, 404));
  }

  res.status(200).json({ status: "success", data: tour });
});

exports.updateTour = catchAsync(async (req, res) => {
  const id = req.params.id;
  const update = await Tour.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: "success", data: update });
});

exports.deletTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleted = await Tour.deleteOne({ _id: id });
  if (deleted.deletedCount === 0) {
    return next(new AppError("No user with this id found", 404));
  }
  res.status(200).json({ status: "success", data: deleted });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingsQuantity" },
        averateRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { averateRating: -1 } },
    // { $match: { _id: { $eq: "hard" } } },
  ]);
  res
    .status(200)
    .json({ status: "Success", Number: stats.length, data: stats });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
  ]);
  res.status(200).json({ status: "Success", Number: plan.length, data: plan });
});
