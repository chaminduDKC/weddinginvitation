import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";
import { UpsertInvitationInput } from "./invitations.schema.js";

/**
 * Fetch all invitations created by the authenticated couple.
 */
export const getUserInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;

    const invitations = await prisma.invitation.findMany({
      where: { userId },
      include: {
        template: {
          select: {
            id: true,
            key: true,
            name: true,
            priceLkr: true,
            thumbnailUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    sendSuccess(res, { invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch an invitation for a specific template.
 */
export const getInvitationByTemplate = async (
  req: Request<{ templateId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { templateId } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId,
        },
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
          },
        },
      },
    });

    if (!invitation) {
      sendError(res, "Invitation not found for this template", 404, "INVITATION_NOT_FOUND");
      return;
    }

    sendSuccess(res, { invitation });
  } catch (error) {
    next(error);
  }
};

/**
 * Upsert (create or update) an invitation customization.
 */
export const upsertInvitation = async (
  req: Request<unknown, unknown, UpsertInvitationInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth!.userId;
    const { templateId, venue, eventDate, heroImageUrl, galleryImages, storyText, mapUrl, brideName, groomName } = req.body;

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template || !template.isActive) {
      sendError(res, "Template not found or inactive", 404, "TEMPLATE_NOT_FOUND");
      return;
    }

    // Update couple names on user if provided
    if (brideName || groomName) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(brideName ? { brideName } : {}),
          ...(groomName ? { groomName } : {}),
        },
      });
    }

    const parsedDate = new Date(eventDate);

    const invitation = await prisma.invitation.upsert({
      where: {
        userId_templateId: {
          userId,
          templateId,
        },
      },
      create: {
        userId,
        templateId,
        venue,
        eventDate: parsedDate,
        heroImageUrl: heroImageUrl ?? undefined,
        galleryImages: galleryImages ?? [],
        storyText: storyText ?? undefined,
        mapUrl: mapUrl ?? undefined,
      },
      update: {
        venue,
        eventDate: parsedDate,
        heroImageUrl: heroImageUrl ?? undefined,
        galleryImages: galleryImages ?? [],
        storyText: storyText ?? undefined,
        mapUrl: mapUrl ?? undefined,
      },
      include: {
        template: {
          select: {
            id: true,
            key: true,
            name: true,
            priceLkr: true,
            thumbnailUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
          },
        },
      },
    });

    sendSuccess(res, {
      message: "Invitation customization saved successfully",
      invitation,
    });
  } catch (error) {
    next(error);
  }
};
