const Tour = require("./../models/tourModels");

exports.getAllTours = async (req, res) => {
  try {
    //Filtering
    const queryObj = { ...req.query };
    const delObj = ["page","sort", "limit"];

    delObj.forEach((el) => {
      delete queryObj[el];
    });
    //Advanced Sorting
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    let query = Tour.find(JSON.parse(queryString));
    if (req.query.sort) {
      query = query.sort("price");
    }
    const tours = await query;
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
