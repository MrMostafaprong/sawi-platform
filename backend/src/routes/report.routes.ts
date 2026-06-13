import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";

const router = Router();

router.get("/my", authenticate, ReportController.myReports);
router.post("/", authenticate, doubleCsrfProtection, ReportController.create);

export default router;
