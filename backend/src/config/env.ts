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
  CORS_ORIGIN: process.env["CORS_ORIGIN"] || "http://localhost:5173",
  DATABASE_URL: process.env["DATABASE_URL"] || "",
};

export const corsOrigins: string[] = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
