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
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  if (!newUser) return next(new AppErr("Error creating User.", 404));
  res.status(201).json({ status: "Success", data: newUser });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findById(req.params.id).select(
    "+active +password"
  );

  if (!updatedUser) return next(new AppErr("User not found", 404));
  const allowed = ["name", "email", "password", "photo", "role", "active"];

  allowed.forEach((elem) => {
    if (req.body[elem] !== undefined) updatedUser[elem] = req.body[elem];
  });

  await updatedUser.save();
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findById(req.params.id).select("+active");
  if (!deletedUser) return next(new AppErr("User not found", 404));
  deletedUser.active = false;
  await deletedUser.save();
  res.status(200).json({
    status: "success",
    message: "User deactivated successfully",
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+active");
  if (!user) return next(new AppErr("User not found", 400));
  res.status(200).json({ status: "Success", data: user });
});
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
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
