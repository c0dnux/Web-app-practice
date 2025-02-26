const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authcontroller");
const multer = require("multer");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.signin);
router.get("/logout", authController.logout);
router.patch("/resetPassword/:token", authController.resetPassword);
router.post("/forgotPassword", authController.forgetPassword);

router.use(authController.protect);
router.patch("/updatePassword", authController.updatePassword);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.patch("/deleteMe", userController.deleteMe);
router.get("/me", userController.getMe, userController.getUser);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
