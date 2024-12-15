const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from config.env
dotenv.config({ path: "./config.env" });

const DB = process.env.DB_LOCAL;
console.log(DB);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const { Schema } = mongoose;
const tourSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  duration: { type: Number, required: true },
  maxGroupSize: { type: Number, required: true },
  difficulty: { type: String, required: true },
  ratingsAverage: { type: Number, default: 0 },
  ratingsQuantity: { type: Number, default: 0 },

  price: { type: Number, required: true },
  priceDiscount: Number,
  summary: { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  imageCover: { type: String, required: true },
  images: [String],
  created: { type: Date, default: Date.now() },
  startDates: [Date],  
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
