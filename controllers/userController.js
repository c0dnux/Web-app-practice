const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const AppErr = require("./../utils/appError");
const bcrypt = require("bcrypt");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res
    .status(200)
    .json({ status: "Success", Length: users.length, data: users });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const update = await User.findByIdAndUpdate(id, req.bod, { new: true });
  res.status(200).json({ status: "Success", data: update });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleteUser = await User.findByIdAndDelete(id);
  if (!deleteUser) {
    return new AppErr("User does not Exist", 400);
  }
  res.status(500).json({ status: "Success", data: deleteUser });
});
