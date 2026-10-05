import rateLimit from "express-rate-limit";
import { sendError } from "../lib/response.js";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      "Too many authentication attempts. Please try again after 15 minutes.",
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 OTP requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      "Too many OTP requests. Please try again later.",
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  },
});
