const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./tourModels");
dotenv.config({ path: "./config.env" });

const DB = process.env.DB_LOCAL;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Reviews DB Running");
  })
  .catch((err) => {
    console.log("Error in reviews DB", err);
  });

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    review: { type: String, required: [true, "Review cannot be empty"] },
    rating: {
      type: Number,
      required: [true, "Rating cannot be empty"],
      enum: [1, 2, 3, 4, 5],
    },
    createdAt: { type: Date, default: Date.now() },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must be referenced to tour"],
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must be referenced to user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "userRef",
    select: "name photo",
  });
  // .populate({
  //   path: "tourRef",
  //   select: "-secretTour -createdAt",
  // });

  next();
});

// Calculate ratingsAverage and ratingsQuantity in the Review model
reviewSchema.statics.calcAverageRatings = async function (tourId) {

  const stats = await this.aggregate([
    // Match reviews for the given tour
    { $match: { tourRef: new mongoose.Types.ObjectId(tourId) } },

    // Group reviews by the tourRef and calculate the average rating and total number of reviews
    {
      $group: {
        _id: "$tourRef", // Group by the tour reference
        ratingsQuantity: { $sum: 1 }, // Count the number of reviews
        ratingsAverage: { $avg: "$rating" }, // Calculate the average rating
      },
    },
  ]);

  // If there are reviews for the given tour, update the tour's ratings
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].ratingsQuantity, // Update the number of reviews
      ratingsAverage: stats[0].ratingsAverage, // Update the average rating
    });
  } else {
    // If no reviews exist, set ratingsQuantity and ratingsAverage to default values
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0, // Default value, assuming new tours have an average rating of 4.5
    });
  }
};

const Reviews = mongoose.model("Review", reviewSchema);

module.exports = Reviews;
