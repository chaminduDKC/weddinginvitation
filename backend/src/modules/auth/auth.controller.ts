import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";
import {
  generateOtpCode,
  hashOtp,
  verifyOtpHash,
  hashToken,
} from "../../lib/crypto.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from "../../lib/jwt.js";
import { setAuthCookies, setAccessTokenCookie, clearAuthCookies } from "../../lib/cookies.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../../lib/email.js";
import {
  RegisterInput,
  VerifyOtpInput,
  ResendOtpInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.schema.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { brideName, groomName, email, phone, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      sendError(res, "An account with this email already exists", 400, "EMAIL_EXISTS");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        brideName,
        groomName,
        email,
        phone,
        passwordHash,
        emailVerifiedAt: null,
      },
    });

    // Generate 6-digit OTP code and store its HMAC hash
    const otpCode = generateOtpCode();
    const codeHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Send email via Brevo (or log to console in dev)
    await sendOtpEmail({
      toEmail: user.email,
      otpCode,
      brideName: user.brideName,
      groomName: user.groomName,
    });

    sendSuccess(
      res,
      {
        message: "Account registered successfully. Please verify your email with the 6-digit OTP.",
        email: user.email,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request<unknown, unknown, VerifyOtpInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, "Invalid email or verification code", 400, "INVALID_CREDENTIALS");
      return;
    }

    if (user.emailVerifiedAt) {
      sendError(res, "Email is already verified. Please log in.", 400, "ALREADY_VERIFIED");
      return;
    }

    // Find the latest active OTP for user
    const otpRecord = await prisma.emailOtp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      sendError(res, "No active verification code found. Please request a new code.", 400, "OTP_NOT_FOUND");
      return;
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { id: otpRecord.id } });
      sendError(res, "Verification code has expired. Please request a new code.", 400, "OTP_EXPIRED");
      return;
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { id: otpRecord.id } });
      sendError(
        res,
        "Maximum verification attempts exceeded. Please request a new code.",
        400,
        "MAX_ATTEMPTS_EXCEEDED"
      );
      return;
    }

    const isValid = verifyOtpHash(otp, otpRecord.codeHash);

    if (!isValid) {
      const updatedAttempts = otpRecord.attempts + 1;
      if (updatedAttempts >= MAX_OTP_ATTEMPTS) {
        await prisma.emailOtp.delete({ where: { id: otpRecord.id } });
        sendError(
          res,
          "Maximum verification attempts exceeded. Please request a new code.",
          400,
          "MAX_ATTEMPTS_EXCEEDED"
        );
        return;
      }

      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: updatedAttempts },
      });

      const remainingAttempts = MAX_OTP_ATTEMPTS - updatedAttempts;
      sendError(
        res,
        `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
        400,
        "INVALID_OTP"
      );
      return;
    }

    // Verification succeeded: mark email verified and purge OTP records
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
      select: {
        id: true,
        brideName: true,
        groomName: true,
        email: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.emailOtp.deleteMany({
      where: { userId: user.id },
    });

    // Issue JWTs and set httpOnly cookies
    const accessToken = signAccessToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const refreshToken = signRefreshToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const tokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: updatedUser.id,
        tokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    sendSuccess(res, {
      message: "Email successfully verified",
      user: updatedUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (
  req: Request<unknown, unknown, ResendOtpInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, "Account with this email does not exist", 404, "USER_NOT_FOUND");
      return;
    }

    if (user.emailVerifiedAt) {
      sendError(res, "Email is already verified. Please log in.", 400, "ALREADY_VERIFIED");
      return;
    }

    // Check 60-second cooldown
    const latestOtp = await prisma.emailOtp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      const elapsedSeconds = Math.floor(
        (Date.now() - latestOtp.createdAt.getTime()) / 1000
      );
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        sendError(
          res,
          `Please wait ${remainingSeconds} seconds before requesting a new code.`,
          429,
          "RESEND_COOLDOWN"
        );
        return;
      }
    }

    // Invalidate existing codes (one live code per user rule)
    await prisma.emailOtp.deleteMany({
      where: { userId: user.id },
    });

    const otpCode = generateOtpCode();
    const codeHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    await sendOtpEmail({
      toEmail: user.email,
      otpCode,
      brideName: user.brideName,
      groomName: user.groomName,
    });

    sendSuccess(res, {
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, "Invalid email or password", 401, "INVALID_CREDENTIALS");
      return;
    }

    if (!user.isActive) {
      sendError(res, "Your account has been deactivated. Contact support.", 403, "ACCOUNT_DISABLED");
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      sendError(res, "Invalid email or password", 401, "INVALID_CREDENTIALS");
      return;
    }

    // If email is not yet verified, instruct frontend to present OTP screen
    if (!user.emailVerifiedAt) {
      res.status(403).json({
        success: false,
        error: "Please verify your email address before logging in.",
        errorCode: "EMAIL_NOT_VERIFIED",
        data: {
          email: user.email,
        },
      });
      return;
    }

    // Issue JWTs and set httpOnly cookies
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const tokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    const safeUser = {
      id: user.id,
      brideName: user.brideName,
      groomName: user.groomName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    sendSuccess(res, {
      message: "Logged in successfully",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawRefreshToken = req.body?.refreshToken || req.cookies?.["refresh_token"];

    if (!rawRefreshToken) {
      sendError(res, "Refresh token required", 401, "NO_REFRESH_TOKEN");
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      clearAuthCookies(res);
      sendError(res, "Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
      return;
    }

    const tokenHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.userId !== payload.userId) {
      clearAuthCookies(res);
      sendError(res, "Refresh token not found", 401, "TOKEN_REVOKED");
      return;
    }

    // Check if token was already revoked (handle rotation grace window)
    if (storedToken.revokedAt !== null) {
      const gracePeriodMs = 60 * 1000; // 60 seconds grace window for concurrent requests / StrictMode
      const timeSinceRevocation = Date.now() - storedToken.revokedAt.getTime();

      if (timeSinceRevocation < gracePeriodMs && storedToken.expiresAt > new Date()) {
        if (!storedToken.user.isActive) {
          clearAuthCookies(res);
          sendError(res, "Account deactivated", 403, "ACCOUNT_DISABLED");
          return;
        }

        // Within grace window: Re-issue a fresh access token without failing or wiping cookies
        const reissuedAccessToken = signAccessToken({
          userId: storedToken.user.id,
          email: storedToken.user.email,
          role: storedToken.user.role,
        });

        setAccessTokenCookie(res, reissuedAccessToken);

        const safeUser = {
          id: storedToken.user.id,
          brideName: storedToken.user.brideName,
          groomName: storedToken.user.groomName,
          email: storedToken.user.email,
          phone: storedToken.user.phone,
          role: storedToken.user.role,
          emailVerifiedAt: storedToken.user.emailVerifiedAt,
          isActive: storedToken.user.isActive,
          createdAt: storedToken.user.createdAt,
        };

        sendSuccess(res, {
          message: "Token refreshed successfully (grace window)",
          user: safeUser,
          accessToken: reissuedAccessToken,
          refreshToken: rawRefreshToken,
        });
        return;
      }

      // Outside grace window: Potential reuse attack or genuine revocation
      clearAuthCookies(res);
      sendError(res, "Refresh token has expired or been revoked", 401, "TOKEN_REVOKED");
      return;
    }

    if (storedToken.expiresAt < new Date()) {
      clearAuthCookies(res);
      sendError(res, "Refresh token has expired", 401, "TOKEN_REVOKED");
      return;
    }

    if (!storedToken.user.isActive) {
      clearAuthCookies(res);
      sendError(res, "Account deactivated", 403, "ACCOUNT_DISABLED");
      return;
    }

    // Revoke previous refresh token (rotation policy)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue newly rotated access and refresh tokens
    const newAccessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      },
    });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    const safeUser = {
      id: storedToken.user.id,
      brideName: storedToken.user.brideName,
      groomName: storedToken.user.groomName,
      email: storedToken.user.email,
      phone: storedToken.user.phone,
      role: storedToken.user.role,
      emailVerifiedAt: storedToken.user.emailVerifiedAt,
      isActive: storedToken.user.isActive,
      createdAt: storedToken.user.createdAt,
    };

    sendSuccess(res, {
      message: "Token refreshed successfully",
      user: safeUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawRefreshToken = req.body?.refreshToken || req.cookies?.["refresh_token"];

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken
        .updateMany({
          where: { tokenHash, revokedAt: null },
          data: { revokedAt: new Date() },
        })
        .catch(() => {
          // Ignore error if already invalid/missing
        });
    }

    clearAuthCookies(res);

    sendSuccess(res, {
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.auth) {
      sendError(res, "Authentication required", 401, "UNAUTHORIZED");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true,
        brideName: true,
        groomName: true,
        email: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, "User not found", 404, "USER_NOT_FOUND");
      return;
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate password reset: validates account and sends 6-digit verification code.
 */
export const forgotPassword = async (
  req: Request<unknown, unknown, ForgotPasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, "No account found with this email address", 404, "USER_NOT_FOUND");
      return;
    }

    if (!user.isActive) {
      sendError(res, "This account is inactive. Please contact support.", 403, "ACCOUNT_DISABLED");
      return;
    }

    // Check 60-second cooldown on reset requests
    const latestOtp = await prisma.emailOtp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      const elapsedSeconds = Math.floor(
        (Date.now() - latestOtp.createdAt.getTime()) / 1000
      );
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        sendError(
          res,
          `Please wait ${remainingSeconds} seconds before requesting a new code.`,
          429,
          "RESEND_COOLDOWN"
        );
        return;
      }
    }

    // Invalidate existing codes
    await prisma.emailOtp.deleteMany({
      where: { userId: user.id },
    });

    const otpCode = generateOtpCode();
    const codeHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    await sendPasswordResetEmail({
      toEmail: user.email,
      otpCode,
      brideName: user.brideName,
      groomName: user.groomName,
    });

    sendSuccess(res, {
      message: "A 6-digit password reset code has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify reset code and set a new password.
 */
export const resetPassword = async (
  req: Request<unknown, unknown, ResetPasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, "Account not found", 404, "USER_NOT_FOUND");
      return;
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      sendError(
        res,
        "No active reset code found. Please request a new verification code.",
        400,
        "OTP_NOT_FOUND"
      );
      return;
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { id: otpRecord.id } });
      sendError(
        res,
        "Verification code has expired. Please request a new code.",
        400,
        "OTP_EXPIRED"
      );
      return;
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { id: otpRecord.id } });
      sendError(
        res,
        "Maximum verification attempts exceeded. Please request a new code.",
        400,
        "MAX_ATTEMPTS_EXCEEDED"
      );
      return;
    }

    const isValid = verifyOtpHash(otp, otpRecord.codeHash);
    if (!isValid) {
      const updatedAttempts = otpRecord.attempts + 1;
      if (updatedAttempts >= MAX_OTP_ATTEMPTS) {
        await prisma.emailOtp.delete({ where: { id: otpRecord.id } });
        sendError(
          res,
          "Maximum verification attempts exceeded. Please request a new code.",
          400,
          "MAX_ATTEMPTS_EXCEEDED"
        );
        return;
      }

      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: updatedAttempts },
      });

      const remainingAttempts = MAX_OTP_ATTEMPTS - updatedAttempts;
      sendError(
        res,
        `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
        400,
        "INVALID_OTP"
      );
      return;
    }

    // OTP is valid! Hash new password with bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and ensure emailVerifiedAt is set
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerifiedAt: user.emailVerifiedAt || new Date(),
      },
      select: {
        id: true,
        brideName: true,
        groomName: true,
        email: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Invalidate OTPs and old refresh tokens for security
    await prisma.emailOtp.deleteMany({
      where: { userId: user.id },
    });
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    // Issue new JWT session
    const accessToken = signAccessToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });
    const refreshToken = signRefreshToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });
    const tokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: updatedUser.id,
        tokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    sendSuccess(res, {
      message: "Password reset successfully! You are now logged in.",
      user: updatedUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
