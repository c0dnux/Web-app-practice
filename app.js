const express = require("express");
const app = express();
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
//            Global MiddleWares


// Development Log

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


// Limitter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 30, // Limit each IP to 30 requests per `window` (here, per 60 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  handler: (req, res, next) => {
    // Custom response when the limit is exceeded
    return next(
      new AppError("Trial limit exceeded. Upgrade to continue.", 429)
    );
  },
});


app.use(limiter);
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
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//Handle all Errors
app.use(globalErrHandler);
module.exports = app;
