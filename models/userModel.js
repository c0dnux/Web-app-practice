const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
  passWord: {
    type: String,
    required: [true, "Provide a password"],
    minLength: [8, "Password must be more than 8 characters"],
    select: false,
  },
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("passWord")) return next();
  this.passWord = await bcrypt.hash(this.passWord, 12);
});
userSchema.methods.isCorrectPassword = async function (
  userPassword,
  hashedPassword
) {
  return await bcrypt.compare(userPassword, hashedPassword);
};
const User = mongoose.model("User", userSchema);

module.exports = User;
