const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authcontroller");

const router = express.Router();
router.post("/signup", authController.signup);
router.post("/login", authController.signin);
router.get(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAllUsers
);
router.patch("/resetPassword/:token", authController.resetPassword);
router.post("/forgotPassword", authController.forgetPassword);
router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);
router.patch("/updateMe", authController.protect, userController.updateMe);
router.patch("/deleteMe", authController.protect, userController.deleteMe);

module.exports = router;
