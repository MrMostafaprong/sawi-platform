import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import { invalidCsrfTokenError } from "./csrf.js";
import { env } from "../config/env.js";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const isDev = env.NODE_ENV === "development";

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

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

  res.status(500).json({
    message: isDev ? err.message : "حدث خطأ في الخادم",
    ...(isDev && { stack: err.stack }),
  });
};
