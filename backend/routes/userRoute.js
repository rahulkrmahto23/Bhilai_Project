const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/token-manager");

// User routes
router.post("/signup", userController.userSignup);
router.post("/login", userController.userLogin);
router.get("/logout", verifyToken, userController.userLogout);

// Permit routes
router.post("/add-permit", verifyToken, userController.createPermit);
router.get("/permits", verifyToken, userController.getAllPermits);
router.get("/permits/:id", verifyToken, userController.getPermitById); // Added this line
router.put("/edit-permit/:id", verifyToken, userController.updatePermit); // Changed from editPermit to updatePermit
router.delete("/delete-permit/:id", verifyToken, userController.deletePermit);
router.get("/search-permits", verifyToken, userController.searchPermits);
router.get("/permits-stats", verifyToken, userController.getPermitStats); // Added this line

module.exports = router;