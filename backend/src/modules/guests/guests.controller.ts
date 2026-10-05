import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";
import { normalizePhoneNumber } from "../../lib/phone.js";
import { CreateGuestInput, UpdateGuestInput } from "./guests.schema.js";

/**
 * List all guests for the authenticated couple.
 */
export const getGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;

    const guests = await prisma.guest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, { guests });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new guest and generate an unguessable invitation token (16+ chars).
 */
export const createGuest = async (
  req: Request<unknown, unknown, CreateGuestInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { name, phone } = req.body;

    // Check if couple has an approved order
    const hasApprovedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.APPROVED,
      },
    });

    if (!hasApprovedOrder) {
      sendError(
        res,
        "You must have an approved template purchase before adding guests.",
        403,
        "ORDER_NOT_APPROVED"
      );
      return;
    }

    // Generate a secure, unguessable random token (32 hex characters = 16 bytes)
    const token = crypto.randomBytes(16).toString("hex");
    const normalizedPhone = normalizePhoneNumber(phone);

    const guest = await prisma.guest.create({
      data: {
        userId,
        name: name.trim(),
        phone: normalizedPhone,
        token,
      },
    });

    sendSuccess(
      res,
      {
        message: "Guest added successfully",
        guest,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing guest.
 */
export const updateGuest = async (
  req: Request<{ id: string }, unknown, UpdateGuestInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { id } = req.params;
    const { name, phone } = req.body;

    const existingGuest = await prisma.guest.findFirst({
      where: { id, userId },
    });

    if (!existingGuest) {
      sendError(res, "Guest not found", 404, "GUEST_NOT_FOUND");
      return;
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(phone ? { phone: normalizePhoneNumber(phone) } : {}),
      },
    });

    sendSuccess(res, {
      message: "Guest updated successfully",
      guest: updatedGuest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a guest from the wedding invitation list.
 */
export const deleteGuest = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { id } = req.params;

    const existingGuest = await prisma.guest.findFirst({
      where: { id, userId },
    });

    if (!existingGuest) {
      sendError(res, "Guest not found", 404, "GUEST_NOT_FOUND");
      return;
    }

    await prisma.guest.delete({
      where: { id },
    });

    sendSuccess(res, {
      message: "Guest deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
