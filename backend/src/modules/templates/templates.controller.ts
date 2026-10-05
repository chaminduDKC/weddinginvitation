import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";

/**
 * Fetch all active invitation templates.
 */
export const getAllTemplates = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      orderBy: { priceLkr: "asc" },
    });

    sendSuccess(res, { templates });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single template by ID or unique key.
 */
export const getTemplateByIdOrKey = async (
  req: Request<{ idOrKey: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrKey } = req.params;

    const template = await prisma.template.findFirst({
      where: {
        OR: [{ id: idOrKey }, { key: idOrKey }],
        isActive: true,
      },
    });

    if (!template) {
      sendError(res, "Template not found", 404, "TEMPLATE_NOT_FOUND");
      return;
    }

    sendSuccess(res, { template });
  } catch (error) {
    next(error);
  }
};
