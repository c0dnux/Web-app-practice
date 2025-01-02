const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { route } = require("../app");
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
  photo: { type: String },
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guid"],
    default: "user",
  },
  passWord: {
    type: String,
    required: [true, "Provide a password"],
    minLength: [8, "Password must be more than 8 characters"],
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: String,
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("passWord")) return next();
  this.passWord = await bcrypt.hash(this.passWord, 12);
});
userSchema.pre("save", function (next) {
  if (!this.isModified("passwordChangedAt")) return next();
  this.passwordChangedAt = Date.now();
  next();
});
userSchema.methods.isCorrectPassword = async function (
  userPassword,
  hashedPassword
) {
  return await bcrypt.compare(userPassword, hashedPassword);
};
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
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000; // Token expires in 10 minutes

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
