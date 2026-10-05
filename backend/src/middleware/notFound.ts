import { Request, Response } from "express";
import { sendError } from "../lib/response.js";

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND");
};
