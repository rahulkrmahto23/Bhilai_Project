const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/token-manager");


router.post("/signup", userController.userSignup);
router.post("/login", userController.userLogin);
router.get("/logout", verifyToken, userController.userLogout);
module.exports = router;