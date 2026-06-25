import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";
import { validate, createReportSchema } from "../middlewares/validate.js";

const router = Router();

router.get("/my", authenticate, ReportController.myReports);
router.post("/", authenticate, doubleCsrfProtection, validate(createReportSchema), ReportController.create);

export default router;
