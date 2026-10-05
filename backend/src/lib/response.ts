import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errorCode?: string
): Response<ApiResponse<never>> => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(errorCode ? { errorCode } : {}),
  });
};
