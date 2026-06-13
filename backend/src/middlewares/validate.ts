import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

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
