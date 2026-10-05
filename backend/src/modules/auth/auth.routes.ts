import { Router } from "express";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { authRateLimiter, otpRateLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

// Registration & Email OTP
router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/verify-otp", otpRateLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", otpRateLimiter, validateBody(resendOtpSchema), resendOtp);

// Password Reset Flow
router.post("/forgot-password", otpRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", otpRateLimiter, validateBody(resetPasswordSchema), resetPassword);

// Session Management
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Profile
router.get("/me", requireAuth, me);

export default router;
