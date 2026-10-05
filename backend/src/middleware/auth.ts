import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/response.js";

export interface AuthContext {
  userId: string;
  email: string;
  role: Role;
  emailVerifiedAt: Date | null;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Middleware ensuring the request is authenticated with a valid access token.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const token = bearerToken || req.cookies?.["access_token"];

    if (!token) {
      sendError(res, "Authentication required", 401, "UNAUTHORIZED");
      return;
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      sendError(res, "Invalid or expired access token", 401, "TOKEN_EXPIRED");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      sendError(res, "User account no longer exists", 401, "USER_NOT_FOUND");
      return;
    }

    if (!user.isActive) {
      sendError(res, "Account has been deactivated", 403, "ACCOUNT_DISABLED");
      return;
    }

    req.auth = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring the authenticated user possesses the required role.
 */
export const requireRole = (requiredRole: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      sendError(res, "Authentication required", 401, "UNAUTHORIZED");
      return;
    }

    if (req.auth.role !== requiredRole) {
      sendError(res, "Forbidden: insufficient permissions", 403, "FORBIDDEN");
      return;
    }

    next();
  };
};

/**
 * Optional middleware to ensure email is verified before accessing certain protected user actions.
 */
export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.auth) {
    sendError(res, "Authentication required", 401, "UNAUTHORIZED");
    return;
  }

  if (!req.auth.emailVerifiedAt) {
    sendError(res, "Email verification required", 403, "EMAIL_NOT_VERIFIED");
    return;
  }

  next();
};
