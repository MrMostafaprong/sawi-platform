import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// ============================================
// Zod Schemas (مستحسن)
// ============================================

export const registerSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  username: z.string()
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .max(30, "اسم المستخدم يجب أن يكون أقل من 30 حرف")
    .regex(/^[a-zA-Z0-9_]+$/, "يمكن استخدام أحرف وأرقام وشرطة سفلية فقط"),
  password: z.string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(128, "كلمة المرور طويلة جداً")
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم"),
  confirmPassword: z.string(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const validate = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };

// ============================================
// Express-Validator (للتوافق مع الكود القديم)
// ============================================

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: "Validation failed", errors: errors.array() });
    return;
  }
  next();
};

export const registerValidation = [
  body("email")
    .isEmail().withMessage("Valid email is required")
    .trim().toLowerCase(),
  body("username")
    .isString().trim()
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .isString()
    .isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
  handleValidationErrors,
];

export const loginValidation = [
  body("email")
    .isEmail().withMessage("Valid email is required")
    .trim().toLowerCase(),
  body("password")
    .isString()
    .notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];
