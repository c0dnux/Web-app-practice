const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppErr = require("./../utils/appError");
const { promisify } = require("util");

const sendEmail = require("./../utils/email");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //Check if token exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppErr("Please Login to get Access", 503));
  }
  ///Check if token is valid
  const jwtPomisified = promisify(jwt.verify);
  const decoded = await jwtPomisified(token, process.env.JWT_SECRET);
  ///Check if user exists
  const userExist = await User.findById(decoded.id);
  if (!userExist) {
    return next(
      AppErr("The user belonging to this token no longer exists", 401)
    );
  }
  //Check if user has changed password after Token was issued
  const passWordChanged = userExist.passwordChangedAfter(decoded.iat);

  if (passWordChanged) {
    return next(new AppErr("User recently changed password, Login again", 401));
  }
  //Give access
  req.user = userExist;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErr("You are not allowed to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErr("No user with the given email", 404));
  }
  const resetToken = user.passwordReset();
  console.log(resetToken);

  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/forgotPassword/${resetToken}`;
  const message = `Forgot passwod ?Click link to reset ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token valid for 5min",
      message,
    });
    res.status(200).json({ status: "Success", message: "Token sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);

    return next(new AppErr("There was an error resetting password", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {});
