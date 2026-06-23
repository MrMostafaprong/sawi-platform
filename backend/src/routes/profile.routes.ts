import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { doubleCsrfProtection } from "../middlewares/csrf.js";
import { upload, MAX_FILES } from "../config/multer.js";
import { validate, updateProfileSchema, addLinkSchema } from "../middlewares/validate.js";

const router = Router();

router.get("/me", authenticate, ProfileController.getMyProfile);
router.put("/me", authenticate, doubleCsrfProtection, validate(updateProfileSchema), ProfileController.updateProfile);
router.post("/avatar", authenticate, doubleCsrfProtection, upload.single("file"), ProfileController.updateAvatar);
router.post("/upload", authenticate, doubleCsrfProtection, upload.single("file"), ProfileController.uploadMedia);
router.post("/upload-multiple", authenticate, doubleCsrfProtection, upload.array("files", MAX_FILES), ProfileController.uploadMultipleMedia);
router.post("/resume", authenticate, doubleCsrfProtection, upload.single("file"), ProfileController.uploadResume);
router.post("/link", authenticate, doubleCsrfProtection, validate(addLinkSchema), ProfileController.addLink);
router.delete("/media/:id", authenticate, doubleCsrfProtection, ProfileController.deleteMedia);
router.patch("/contact-visibility", authenticate, doubleCsrfProtection, ProfileController.toggleContactVisibility);
router.get("/:username", ProfileController.getPublicProfile);

export default router;
