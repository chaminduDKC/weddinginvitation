import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  OTP_HMAC_SECRET: z.string().min(16, "OTP_HMAC_SECRET must be at least 16 characters"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().optional(),
  BREVO_SENDER_NAME: z.string().default("Wedding Platform"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  // In development, provide a helpful error message but allow initialization if needed
  if (process.env["NODE_ENV"] === "production") {
    process.exit(1);
  }
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      NODE_ENV: (process.env["NODE_ENV"] as "development" | "production" | "test") || "development",
      PORT: parseInt(process.env["PORT"] || "5000", 10),
      DATABASE_URL: process.env["DATABASE_URL"] || "postgresql://postgres:postgres@localhost:5432/wedding_db",
      DIRECT_URL: process.env["DIRECT_URL"],
      JWT_ACCESS_SECRET: process.env["JWT_ACCESS_SECRET"] || "development_access_secret_min_16_chars!",
      JWT_REFRESH_SECRET: process.env["JWT_REFRESH_SECRET"] || "development_refresh_secret_min_16_chars!",
      OTP_HMAC_SECRET: process.env["OTP_HMAC_SECRET"] || "development_hmac_secret_min_16_chars!",
      FRONTEND_URL: process.env["FRONTEND_URL"] || "http://localhost:5173",
      BREVO_API_KEY: process.env["BREVO_API_KEY"],
      BREVO_SENDER_EMAIL: process.env["BREVO_SENDER_EMAIL"] || "noreply@weddinginvites.com",
      BREVO_SENDER_NAME: process.env["BREVO_SENDER_NAME"] || "Wedding Platform",
      CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"],
      CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"],
      CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"],
    };
