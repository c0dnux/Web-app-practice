const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const AppErr = require("./../utils/appError");
const { signTokenHandler } = require("./../utils/customfuncs");
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("+active");
  res
    .status(200)
    .json({ status: "Success", Length: users.length, data: users });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // const user = await User.findById(req.user._id);
  // if (req.body.name) user.name = req.body.name;
  // if (req.body.email) user.email = req.body.email;
  // await user.save();
  const allowedFields = ["name", "email", "photo"];
  const updates = {};
  allowedFields.forEach((el) => {
    if (req.body[el]) updates[el] = req.body[el];
  });
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  signTokenHandler(200, "User updated", res, user);
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(202).json({ status: "Success", data: "Account deleted" });
});
