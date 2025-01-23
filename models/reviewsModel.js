const mongoose = require("mongoose");
const dotenv = require("dotenv");
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
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    createdAt: { type: Date, default: Date.now() },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      //   required: [true, "Review must be referenced to tour"],
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      //   required: [true, "Review must be referenced to user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "userRef",
    select: "name photo",
  }).populate({
    path: "tourRef",
    select: "-secretTour -createdAt",
    options: { strictPopulate: false },
  });

  next();
});
const Reviews = mongoose.model("Review", reviewSchema);

module.exports = Reviews;
