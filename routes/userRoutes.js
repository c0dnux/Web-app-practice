const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authcontroller");

const router = express.Router();
router.post("/signup", authController.signup);
router.post("/login", authController.signin);
router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
