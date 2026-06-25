import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string, value: string | undefined): string {
  if (!value) throw new Error(`${key} is required in .env`);
  return value;
}

export const env = {
  PORT: parseInt(process.env["PORT"] || "8000", 10),
  NODE_ENV: process.env["NODE_ENV"] || "development",
  JWT_SECRET: requireEnv("JWT_SECRET", process.env["JWT_SECRET"]),
  JWT_EXPIRES_IN: process.env["JWT_EXPIRES_IN"] || "7d",
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET", process.env["JWT_REFRESH_SECRET"]),
  JWT_REFRESH_EXPIRES_IN: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
  CORS_ORIGIN: process.env["CORS_ORIGIN"] || "http://localhost:5173",
  DATABASE_URL: requireEnv("DATABASE_URL", process.env["DATABASE_URL"]),
  DIRECT_URL: process.env["DIRECT_URL"],
  BCRYPT_SALT_ROUNDS: parseInt(process.env["BCRYPT_SALT_ROUNDS"] || "12", 10),
  CSRF_SECRET: requireEnv("CSRF_SECRET", process.env["CSRF_SECRET"]),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100", 10),
};

export const corsOrigins: string[] = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
