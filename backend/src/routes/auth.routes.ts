import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validate, registerSchema, loginSchema } from "../middlewares/validate.js";

const router = Router();

router.post("/register", authLimiter, doubleCsrfProtection, validate(registerSchema), AuthController.register);
router.post("/login", authLimiter, doubleCsrfProtection, validate(loginSchema), AuthController.login);
router.post("/refresh", authLimiter, doubleCsrfProtection, AuthController.refresh);
router.post("/logout", doubleCsrfProtection, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
