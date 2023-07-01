//initialize router
const { Router } = require("express");
const router = Router();

//authentication contoller import
const authController = require("../controllers/authController");

//routes to the middleware
router.post("/api/signup", authController.signup_post);
router.post("/api/login", authController.login_post);
router.post("/api/verify", authController.verify);

module.exports = router;
