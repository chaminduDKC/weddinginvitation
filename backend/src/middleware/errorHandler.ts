import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../lib/response.js";

export class AppError extends Error {
  public statusCode: number;
  public errorCode?: string;

  constructor(message: string, statusCode = 400, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const formattedError = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    sendError(res, formattedError, 400, "VALIDATION_ERROR");
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errorCode);
    return;
  }

  console.error("Unhandled Error:", err);
  const message =
    process.env["NODE_ENV"] === "production" ? "Internal Server Error" : (err as Error)?.message || "Internal Server Error";
  sendError(res, message, 500, "INTERNAL_SERVER_ERROR");
};
