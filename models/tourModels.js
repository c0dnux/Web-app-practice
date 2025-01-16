const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");
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
const tourSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String },
    duration: { type: Number, required: true },
    maxGroupSize: { type: Number, required: true },
    difficulty: { type: String, required: true },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, "Min rating is 1"],
      max: [5, "Max rating is 5"],
    },
    ratingsQuantity: { type: Number, default: 0 },

    price: { type: Number, required: true },
    priceDiscount: {
      type: Number,
      //wORK ONLY ON NEW
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price {VALUE} should be less than Actual price",
      },
    },
    summary: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    imageCover: { type: String, required: true },
    images: [String],
    created: { type: Date, default: Date.now() },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: "Point" },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//"Save"Document middleware runs before .save()or .create() but not on inserMany
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });
//
//
//Query Middleware
//This applies for all containing find
tourSchema.pre(/^find/, function (next) {
  //This applies for only find not findOne or findbyid
  // tourSchema.pre("find", function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  console.log(`${Date.now() - this.start}`);

  next();
});

//Aggregation Malware
tourSchema.pre("aggregate", function (next) {
  this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this._pipeline);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
