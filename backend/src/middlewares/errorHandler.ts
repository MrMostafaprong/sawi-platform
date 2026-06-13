import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import { invalidCsrfTokenError } from "./csrf.js";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error(err.message, { stack: err.stack });

  if (err === invalidCsrfTokenError) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }

  if (err.message.includes("للنساء فقط") || err.message.includes("female-only") || err.message.includes("female users only")) {
    res.status(403).json({ message: err.message });
    return;
  }

  if (err.message.includes("already in use")) {
    res.status(409).json({ message: err.message });
    return;
  }

  if (err.message.toLowerCase().includes("lock") || err.message.includes("locked")) {
    res.status(423).json({ message: err.message });
    return;
  }

  res.status(400).json({ message: err.message });
};
