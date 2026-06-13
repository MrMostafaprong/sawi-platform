import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";
import { registerValidation, loginValidation } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, doubleCsrfProtection, registerValidation, AuthController.register);
router.post("/login", authLimiter, doubleCsrfProtection, loginValidation, AuthController.login);
router.post("/logout", doubleCsrfProtection, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
