const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const User = require("./../models/userModel");
const AppErr = require("./../utils/appError");
const { signTokenHandler } = require("./../utils/customfuncs");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppErr("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
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

  // const allowedFields = ["name", "email", "photo"];
  // const updates = {};
  // allowedFields.forEach((el) => {
  //   if (req.body[el]) updates[el] = req.body[el];
  // });

  const allowedFields = ["name", "email"];
  const updates = Object.assign({}, req.body); // Removes null prototype

  allowedFields.forEach((el) => {
    if (updates[el]) updates[el] = updates[el];
  });

  if (req.file) {
    updates.photo = `${req.file.filename}`;
  }
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
