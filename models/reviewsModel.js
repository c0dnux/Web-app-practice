const mongoose = require("mongoose");
const dotenv=require("dotenv")
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
    review: { type: String, required: [true, ""] },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    createdAt: { type: Date, default: Date.now() },
    tourRef: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must be referenced to tour"],
    },
    userRef: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must be referenced to user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Reviews = mongoose.model("Review", reviewSchema);

module.exports = Reviews;
