import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "./env.js";

export interface JwtAuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days
export const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

/**
 * Generate a short-lived access token (15 minutes).
 */
export const signAccessToken = (payload: JwtAuthPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  });
};

/**
 * Generate a long-lived refresh token (30 days).
 */
export const signRefreshToken = (payload: JwtAuthPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
};

/**
 * Verify and decode an access token.
 */
export const verifyAccessToken = (token: string): JwtAuthPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAuthPayload;
};

/**
 * Verify and decode a refresh token.
 */
export const verifyRefreshToken = (token: string): JwtAuthPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtAuthPayload;
};
