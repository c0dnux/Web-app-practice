process.on("uncaughtException", (err) => {
  console.log(err.message);

  process.exit(1);
});
const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log("Listening");
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UnhandledRejection");
  server.close(() => {
    process.exit(1);
  });
});

