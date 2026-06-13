import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env, corsOrigins } from "./config/env.js";
import { logger } from "./config/logger.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { generateCsrfToken, setSessionCookie } from "./middlewares/csrf.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import groupRoutes from "./routes/group.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import reportRoutes from "./routes/report.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigins.some((o) => origin.startsWith(o))) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
}));
app.use(apiLimiter);
app.use(express.json());
app.use(cookieParser());

app.use(morgan("combined", {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
}));

app.use(setSessionCookie);

app.get("/api/csrf-token", (req, res) => {
  // Force overwrite to ensure token is always fresh and matches current session
  res.json({ csrfToken: generateCsrfToken(req, res, { overwrite: true }) });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use("/uploads", express.static("uploads"));

app.use(errorHandler);

export default app;
