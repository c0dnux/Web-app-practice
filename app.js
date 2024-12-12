const express = require("express");
const app = express();
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

//MiddleWares
if (process.env.NODE_ENV==="development") {
  app.use(morgan("dev"));

}
app.use(express.json());
app.use((req, res, next) => {
  console.log("Woooooow");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
module.exports = app; 
