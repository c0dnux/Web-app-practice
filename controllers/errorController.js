const AppError = require("./../utils/appError");

const handleCastErrDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};
const handleValErrDB = (err) => {
  const errors = Object.values(err.errors).map((elem) => elem.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleDuplErrDB = (err) => {
  const [key, value] = Object.entries(err.errorResponse.keyValue)[0];

  const message = `${key} :${value} already exists.`;
  return new AppError(message, 403);
};
const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrProduc = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error", err);
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  if (process.env.NODE_ENV === "development") {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));
    if (error.name === "CastError") error = handleCastErrDB(error);
    if (error.code === 11000) error = handleDuplErrDB(error);
    if (error.name === "ValidationError") error = handleValErrDB(error);

    sendErrProduc(error, res);
  }
};
