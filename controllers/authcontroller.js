const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppErr = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    passWord: req.body.passWord,
  });
  const token = signToken(newUser._id);
  res
    .status(201)
    .json({ status: "Success", token, Number: newUser.length, data: newUser });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppErr("Provide email and password"));
  }

  const user = await User.findOne({ email }).select("+passWord");
  const isCorrect = await user.isCorrectPassword(password, user.passWord);
  const token = signToken(user._id);

  if (!user || !isCorrect) {
    return next(new AppErr("Incorrect username or password", 401));
  }
  res.status(200).json({ status: "Success", token, data: user });
});
