import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";
import { validate, registerSchema, loginSchema } from "../middlewares/validate.js";

const router = Router();

router.post("/register", doubleCsrfProtection, validate(registerSchema), AuthController.register);
router.post("/login", doubleCsrfProtection, validate(loginSchema), AuthController.login);
router.post("/refresh", doubleCsrfProtection, AuthController.refresh);
router.post("/logout", doubleCsrfProtection, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
