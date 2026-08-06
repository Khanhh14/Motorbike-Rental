const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const validateMiddleware = require("../middleware/validate.middleware");
const { authenticateJWT } = require("../middleware/validate.middleware");

router.post("/register", validateMiddleware.validateRegister, authController.register);
router.post("/login", validateMiddleware.validateLogin, authController.login);
router.get("/me", authenticateJWT, authController.getUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-code", authController.verifyResetCode);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", authenticateJWT, authController.changePassword);

module.exports = router;