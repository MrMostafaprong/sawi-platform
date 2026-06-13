import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/admin.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/reports", AdminController.getPendingReports);
router.patch("/reports/:id", doubleCsrfProtection, AdminController.resolveReport);
router.post("/users/:id/ban", doubleCsrfProtection, AdminController.banUser);
router.post("/users/:id/unban", doubleCsrfProtection, AdminController.unbanUser);
router.get("/images/pending", AdminController.getPendingImages);
router.patch("/images/:id/approve", doubleCsrfProtection, AdminController.approveImage);
router.patch("/images/:id/reject", doubleCsrfProtection, AdminController.rejectImage);
router.get("/users", AdminController.getAllUsers);

export default router;
