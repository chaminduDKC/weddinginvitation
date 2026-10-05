import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";
import { uploadSlipToCloudinary } from "../../lib/cloudinary.js";
import { OrderStatus } from "@prisma/client";

/**
 * Fetch all orders placed by the authenticated couple.
 * Note: Per requirement, users can only see their own status (no admin slip URLs).
 */
export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        templateId: true,
        status: true,
        note: true,
        reviewedAt: true,
        createdAt: true,
        template: {
          select: {
            id: true,
            key: true,
            name: true,
            priceLkr: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, { orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new order with bank transfer slip upload.
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { templateId } = req.body;
    const file = req.file;

    if (!templateId) {
      sendError(res, "Template ID is required", 400, "MISSING_TEMPLATE_ID");
      return;
    }

    if (!file) {
      sendError(res, "Please upload your bank transfer payment slip", 400, "MISSING_SLIP_FILE");
      return;
    }

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template || !template.isActive) {
      sendError(res, "Template not found or inactive", 404, "TEMPLATE_NOT_FOUND");
      return;
    }

    // Check if user already has an APPROVED order
    const existingApproved = await prisma.order.findFirst({
      where: {
        userId,
        templateId,
        status: OrderStatus.APPROVED,
      },
    });

    if (existingApproved) {
      sendError(res, "You already have an approved order for this template", 400, "ALREADY_PURCHASED");
      return;
    }

    // Check if user has a PENDING order
    const existingPending = await prisma.order.findFirst({
      where: {
        userId,
        templateId,
        status: OrderStatus.PENDING,
      },
    });

    if (existingPending) {
      sendError(
        res,
        "You already have a pending order for this template awaiting review",
        400,
        "ORDER_PENDING"
      );
      return;
    }

    // Upload slip to Cloudinary with type: "authenticated"
    const uploadResult = await uploadSlipToCloudinary(
      file.buffer,
      file.mimetype,
      userId
    );

    const order = await prisma.order.create({
      data: {
        userId,
        templateId,
        status: OrderStatus.PENDING,
        slipUrl: uploadResult.secureUrl,
        slipPublicId: uploadResult.publicId,
      },
      select: {
        id: true,
        templateId: true,
        status: true,
        createdAt: true,
        template: {
          select: {
            id: true,
            key: true,
            name: true,
            priceLkr: true,
          },
        },
      },
    });

    sendSuccess(
      res,
      {
        message: "Payment slip submitted successfully. Awaiting administrative approval.",
        order,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch latest order status for a specific template.
 */
export const getOrderStatusForTemplate = async (
  req: Request<{ templateId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { templateId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        userId,
        templateId,
      },
      select: {
        id: true,
        templateId: true,
        status: true,
        note: true,
        reviewedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, { order });
  } catch (error) {
    next(error);
  }
};
