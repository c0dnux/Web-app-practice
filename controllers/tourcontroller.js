const Tour = require("./../models/tourModels");
const APIFeatures = require("./../utils/apiFeatures");
//Alias Middle WAre
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,ratingAverage";
  req.query.fields = "name,price,maxGroupSize";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error writing new tour:", error);
    res.status(500).json({ status: "Failed", error: error });
  }
};

exports.writeTour = async (req, res) => {
  try {
    const dbRes = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: dbRes,
    });
  } catch (error) {
    console.error("Error writing new tour:", error);
    res.status(500).json({ status: "Failed", error: error });
  }
};

exports.getTour = async (req, res) => {
  try {
    const id = req.params.id;

    const tour = await Tour.findById(id);

    res.status(200).json({ status: "success", data: tour });
  } catch (error) {
    console.error("Error writing new tour:", error);
    res.status(500).json({ status: "Failed", error: error });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const id = req.params.id;
    const update = await Tour.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.status(200).json({ status: "success", data: update });
  } catch (error) {
    console.error("Error updating tour:", error);
    res.status(500).json({ status: "Failed", error: error.message });
  }
};

exports.deletTour = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Tour.deleteOne({ _id: id });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No tour found with that ID",
      });
    }
    res.status(200).json({ status: "success", data: deleted });
  } catch (error) {
    res.status(500).json({ status: "Failed", error: error });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ status: "Failed", Error: error });
  }
};
exports.getMonthlyPlan = async (req, res) => {
  try {
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
    res
      .status(200)
      .json({ status: "Success", Number: plan.length, data: plan });
  } catch (error) {
    res.status(500).json({ status: "Failed", Error: error });
  }
};
