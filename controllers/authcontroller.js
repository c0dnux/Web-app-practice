const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppErr = require("./../utils/appError");
const { promisify } = require("util");
const crypto = require("crypto");
const { signTokenHandler } = require("./../utils/customfuncs");
const sendEmail = require("./../utils/email");
const AppError = require("./../utils/appError");

exports.signup = catchAsync(async (req, res, next) => {
  const allowed = ["name", "email", "password", "photo"];
  let gotten = {};
  allowed.forEach((elem) => {
    if (req.body[elem]) gotten[elem] = req.body[elem];
  });
  const newUser = await User.create(gotten);

  // const token = signToken(newUser._id);
  // res
  //   .status(201)
  //   .json({ status: "Success", token, Number: newUser.length, data: newUser });
  signTokenHandler(201, "user created", res, newUser);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppErr("Provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password +active");
  if (!user) {
    return next(new AppErr("Incorrect email or password.", 404));
  }

  if (!user.active) {
    return next(new AppErr("This acount is deleted", 401));
  }
  const isCorrect = await user.isCorrectPassword(password, user.password);

  if (!user || !isCorrect) {
    return next(new AppErr("Incorrect username or password", 401));
  }
  // const token = signToken(user._id);
  // res.status(200).json({ status: "Success", token, data: user });
  signTokenHandler(200, "Logged in", res, user, req.rateLimit);
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
      new AppErr("The user belonging to this token no longer exists", 401)
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

  await user.save();
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot password ? Click link to reset ${resetURL}`;
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

    return next(new AppErr("There was an error resetting password", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  const hashToken = crypto
    .createHash("sha256")
    .update(String(resetToken))
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Reset token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  console.log(user, hashToken);
  // const token = signToken(user._id);

  // res
  //   .status(200)
  //   .json({ status: "Success", message: "Updated your password", token });
  signTokenHandler(200, "Check Email", res, user);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (
    !(await user.isCorrectPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppErr("Your current password is wrong", 401));
  }

  user.password = req.body.password;

  await user.save();

  const token = signToken(user._id);

  res
    .status(200)
    .json({ status: "Success", message: "Password updated", token });
  signTokenHandler(200, "Password updated", res, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (
    !(await user.isCorrectPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError("Your current password is wrong", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  // const token = signToken(user._id);
  // res
  //   .status(200)
  //   .json({ status: "Success", message: "Password updated", token });
  signTokenHandler(200, "Password updated", res, user);
});
