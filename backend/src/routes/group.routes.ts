import { Router } from "express";
import { GroupController } from "../controllers/group.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";

const router = Router();

router.get("/search", authenticate, GroupController.search);
router.get("/my", authenticate, GroupController.myGroups);

router.get("/:id", GroupController.getById);
router.post("/", authenticate, doubleCsrfProtection, GroupController.create);
router.put("/:id", authenticate, doubleCsrfProtection, GroupController.update);
router.delete("/:id", authenticate, doubleCsrfProtection, GroupController.delete);
router.post("/:id/join", authenticate, doubleCsrfProtection, GroupController.join);
router.post("/:id/leave", authenticate, doubleCsrfProtection, GroupController.leave);
router.post("/:id/follow", authenticate, doubleCsrfProtection, GroupController.follow);
router.post("/:id/unfollow", authenticate, doubleCsrfProtection, GroupController.unfollow);
router.post("/:id/review", authenticate, doubleCsrfProtection, GroupController.createReview);
router.get("/:id/reviews", GroupController.getReviews);

export default router;
