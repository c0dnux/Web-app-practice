const express = require("express");
const app = express();
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrHandler = require("./controllers/errorController");
//MiddleWares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
//Catch undefinded path
app.all("*", (req, res, next) => {
  // res
  //   .status(404)
  //   .json({ status: "Failed", message: `Cant find ${req.originalUrl}` });
  // const err = new Error(`Cant find ${req.originalUrl}`);
  // err.status = "Fail";
  // err.statusCode = 404;

  //whenever we pass somrthing in the next it assumes there is an error
  next(new AppError(`Cant find `, 404));
});

//Handle all Errors
app.use(globalErrHandler);
module.exports = app;
