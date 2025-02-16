const express = require("express");
const router = express.Router();
const viewController = require(".././controllers/viewController");
const authController = require(".././controllers/authcontroller");

router.use(authController.isLoggedIn);
router.get("/me", viewController.getAccount);
router.get("/login", viewController.login);
router.get("/", viewController.tourOverview);
router.get("/tour/:slug", viewController.getTour);

module.exports = router;
