import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/search", authenticate, UserController.search);

export default router;
