const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const ems = require("express-mongo-sanitize");
const sanitizeHtml = require("sanitize-html");

const hpp = require("hpp");
//            Global MiddleWares

//Set security HTTP headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https: 'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  })
);

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

app.use(express.static(path.join(__dirname, "public")));

app.use(limiter);
//Body Parser (req.body)
app.use(express.json());

//data sanitization against NoSQL query injection
app.use(ems());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(
      JSON.stringify(req.body, (key, value) =>
        typeof value === "string"
          ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
          : value
      )
    );
  }
  next();
});
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
///Route handlers
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRoutes);

//Catch undefinded path
app.all("*", (req, res, next) => {
  //whenever we pass somrthing in the next it assumes there is an error
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//Handle all Errors
app.use(globalErrHandler);
module.exports = app;
