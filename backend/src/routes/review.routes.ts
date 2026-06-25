import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";
import { validate, createReviewSchema } from "../middlewares/validate.js";

const router = Router();

router.get("/:userId", ReviewController.getForUser);
router.post("/", authenticate, doubleCsrfProtection, validate(createReviewSchema), ReviewController.create);
router.delete("/:id", authenticate, doubleCsrfProtection, ReviewController.delete);

export default router;
