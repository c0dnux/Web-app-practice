const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const DB = "mongodb://localhost:27017/Abdul";

mongoose
  .connect(DB)
  .then(() => {
    console.log("User DB Launched");
  })
  .catch((err) => {
    console.log(err);
  });
const userSchema = new Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    unique: true,
    required: [true, "Please Provide email"],
    lowerCase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: { type: String, default: "default.jpg" },
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Provide a password"],
    minLength: [8, "Password must be more than 8 characters"],
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Set passwordChangedAt field
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.isCorrectPassword = async function (
  userPassword,
  hashedPassword
) {
  return await bcrypt.compare(userPassword, hashedPassword);
};
// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });

//   next();
// });
userSchema.methods.passwordChangedAfter = function (userTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return changedTimeStamp > userTimeStamp;
  }
  return false;
};
userSchema.methods.passwordReset = function () {
  const resetToken = Math.floor(100000 + Math.random() * 900000);
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(String(resetToken))
    .digest("hex");
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000; // Token expires in 5 minutes

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
