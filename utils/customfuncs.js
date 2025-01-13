const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  });
};
exports.signTokenHandler = (statusCode, message, res, user) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure secure in production
  };
  res.cookie("jwt", cookieOptions, token);
  user.passWord = "**********";
  res.status(statusCode).json({
    status: "Success",
    token,
    message: message,
    Number: user.length,
    data: user,
  });
};
