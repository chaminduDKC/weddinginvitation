import crypto from "crypto";
import { env } from "./env.js";

/**
 * Generate a cryptographically secure 6-digit numeric OTP code.
 */
export const generateOtpCode = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP code using HMAC-SHA256 with the secret key.
 * Never store plain OTP codes in the database.
 */
export const hashOtp = (otp: string): string => {
  return crypto
    .createHmac("sha256", env.OTP_HMAC_SECRET)
    .update(otp)
    .digest("hex");
};

/**
 * Compare an entered OTP code against the stored HMAC hash using timing-safe comparison.
 */
export const verifyOtpHash = (enteredOtp: string, storedHash: string): boolean => {
  const enteredHash = hashOtp(enteredOtp);
  const enteredBuffer = Buffer.from(enteredHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (enteredBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(enteredBuffer, storedBuffer);
};

/**
 * Hash a refresh token using SHA-256 for secure database storage.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate a random unguessable token (e.g. for guest links or refresh tokens).
 */
export const generateSecureToken = (byteLength = 32): string => {
  return crypto.randomBytes(byteLength).toString("hex");
};
