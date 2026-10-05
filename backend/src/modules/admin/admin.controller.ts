import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";
import { generateSignedSlipUrl, uploadPublicImageToCloudinary } from "../../lib/cloudinary.js";
import {
  ReviewOrderInput,
  ToggleUserStatusInput,
  UpdateTemplateInput,
} from "./admin.schema.js";

/**
 * List all orders for administrative review.
 * Generates signed time-limited authenticated URLs for slips.
 */
export const getAdminOrders = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
            email: true,
            phone: true,
          },
        },
        template: {
          select: {
            id: true,
            key: true,
            name: true,
            priceLkr: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const ordersWithSignedUrls = orders.map((order) => {
      let signedSlipUrl = "";
      if (order.slipPublicId) {
        if (order.slipPublicId.startsWith("mock_slip_")) {
          // In development mock mode, use stored data URI or fallback
          signedSlipUrl = order.slipUrl || "";
        } else {
          signedSlipUrl = generateSignedSlipUrl(order.slipPublicId);
        }
      }

      return {
        ...order,
        signedSlipUrl,
      };
    });

    sendSuccess(res, { orders: ordersWithSignedUrls });
  } catch (error) {
    next(error);
  }
};

/**
 * Review an order: Approve or Reject with an optional note.
 */
export const reviewOrder = async (
  req: Request<{ id: string }, unknown, ReviewOrderInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        template: true,
      },
    });

    if (!order) {
      sendError(res, "Order not found", 404, "ORDER_NOT_FOUND");
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        note: note ?? order.note,
        reviewedAt: new Date(),
      },
      include: {
        template: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
            email: true,
          },
        },
      },
    });

    sendSuccess(res, {
      message: `Order successfully ${status.toLowerCase()}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users with optional search query and order statistics.
 */
export const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"].trim() : "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { brideName: { contains: search, mode: "insensitive" } },
              { groomName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
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
        _count: {
          select: {
            orders: true,
            invitations: true,
            guests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, { users });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable or disable a user account.
 */
export const toggleUserStatus = async (
  req: Request<{ id: string }, unknown, ToggleUserStatusInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminId = req.auth!.userId;

    if (id === adminId) {
      sendError(res, "You cannot modify your own administrator account status", 400, "CANNOT_MODIFY_SELF");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      sendError(res, "User not found", 404, "USER_NOT_FOUND");
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    sendSuccess(res, {
      message: `User account has been ${isActive ? "activated" : "deactivated"}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Permanently delete a user and all associated records (orders, invitations, guests, tokens, OTPs).
 */
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.auth!.userId;

    if (id === adminId) {
      sendError(res, "You cannot delete your own administrator account", 400, "CANNOT_DELETE_SELF");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, brideName: true, groomName: true },
    });

    if (!user) {
      sendError(res, "User not found", 404, "USER_NOT_FOUND");
      return;
    }

    // Prisma schema specifies `onDelete: Cascade` on:
    // orders, invitations, guests, emailOtps, refreshTokens
    await prisma.user.delete({
      where: { id },
    });

    sendSuccess(res, {
      message: `User ${user.email} and all associated records have been permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all templates for admin management.
 */
export const getAdminTemplates = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { priceLkr: "asc" },
    });

    sendSuccess(res, { templates });
  } catch (error) {
    next(error);
  }
};

/**
 * Update template details: name, thumbnailUrl, description, priceLkr, isActive.
 */
export const updateTemplate = async (
  req: Request<{ id: string }, unknown, UpdateTemplateInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, thumbnailUrl, description, priceLkr, isActive } = req.body;

    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      sendError(res, "Template not found", 404, "TEMPLATE_NOT_FOUND");
      return;
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(description !== undefined && { description }),
        ...(priceLkr !== undefined && { priceLkr }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    sendSuccess(res, {
      message: "Template updated successfully",
      template: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a new thumbnail image for a template.
 */
export const uploadTemplateThumbnail = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      sendError(res, "Thumbnail image file is required", 400, "FILE_REQUIRED");
      return;
    }

    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      sendError(res, "Template not found", 404, "TEMPLATE_NOT_FOUND");
      return;
    }

    const uploadResult = await uploadPublicImageToCloudinary(
      file.buffer,
      file.mimetype,
      `template_${existing.key}`
    );

    const updated = await prisma.template.update({
      where: { id },
      data: {
        thumbnailUrl: uploadResult.secureUrl,
      },
    });

    sendSuccess(res, {
      message: "Template thumbnail updated successfully",
      template: updated,
      thumbnailUrl: uploadResult.secureUrl,
    });
  } catch (error) {
    next(error);
  }
};
