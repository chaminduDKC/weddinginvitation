import { Request, Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../../lib/response.js";
import { verifyAccessToken } from "../../lib/jwt.js";
import { getContactDetailsData } from "../../lib/contactDetails.js";

/**
 * Public Invitation Endpoint.
 * Resolves guest -> owner -> invitation by token.
 * Non-negotiable design decision #1: Guest links use unguessable token (/i/:token), never exposes user/guest IDs.
 * Non-negotiable design decision #2: Server-side check that owner has an APPROVED order for template.
 * Returns strictly only fields needed by invitation (no email/phone of owner, no other guests).
 * Marks viewedAt on first visit.
 */
export const getPublicInvitation = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token || token.length < 16) {
      sendError(res, "Invalid invitation link", 400, "INVALID_TOKEN");
      return;
    }

    // Resolve guest by unguessable token
    const guest = await prisma.guest.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
            isActive: true,
          },
        },
      },
    });

    if (!guest || !guest.user || !guest.user.isActive) {
      sendError(res, "Invitation not found or link has expired", 404, "INVITATION_NOT_FOUND");
      return;
    }

    const requestedTemplate =
      ((req.query.template as string) || (req.query.t as string))?.trim();

    // Server-side check: owner MUST have an APPROVED order
    const approvedOrders = await prisma.order.findMany({
      where: {
        userId: guest.userId,
        status: OrderStatus.APPROVED,
      },
      include: {
        template: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Check if requester is the owner couple previewing their invitation
    let isOwner = false;
    const authToken =
      req.cookies?.["access_token"] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    if (authToken) {
      try {
        const payload = verifyAccessToken(authToken);
        if (payload.userId === guest.userId) {
          isOwner = true;
        }
      } catch {
        // Not owner or token expired
      }
    }

    // Match requested template among approved orders
    let approvedOrder = null;
    if (requestedTemplate && approvedOrders.length > 0) {
      approvedOrder =
        approvedOrders.find(
          (o) =>
            o.template?.key.toLowerCase() === requestedTemplate.toLowerCase() ||
            o.templateId === requestedTemplate
        ) || null;
    }

    // If no specific match or no template requested, default to the latest approved order
    if (!approvedOrder && approvedOrders.length > 0) {
      approvedOrder = approvedOrders[0];
    }

    let activeTemplateKey = approvedOrder?.template?.key;
    let invitation = null;

    if (approvedOrder && approvedOrder.template) {
      activeTemplateKey = approvedOrder.template.key;
      invitation = await prisma.invitation.findUnique({
        where: {
          userId_templateId: {
            userId: guest.userId,
            templateId: approvedOrder.templateId,
          },
        },
      });

      // If user has not created a specific invitation for this template, fall back to their latest customized one
      if (!invitation) {
        invitation = await prisma.invitation.findFirst({
          where: { userId: guest.userId },
          orderBy: { updatedAt: "desc" },
        });
      }
    } else if (isOwner) {
      // Allow owner to preview even if order is not approved yet
      if (requestedTemplate) {
        const reqTemplate = await prisma.template.findUnique({
          where: { key: requestedTemplate },
        });
        if (reqTemplate) {
          activeTemplateKey = reqTemplate.key;
          invitation = await prisma.invitation.findUnique({
            where: {
              userId_templateId: {
                userId: guest.userId,
                templateId: reqTemplate.id,
              },
            },
          });
        }
      }

      if (!activeTemplateKey) {
        const fallbackInv = await prisma.invitation.findFirst({
          where: { userId: guest.userId },
          include: { template: true },
          orderBy: { updatedAt: "desc" },
        });

        if (fallbackInv && fallbackInv.template) {
          activeTemplateKey = fallbackInv.template.key;
          invitation = fallbackInv;
        } else {
          const defaultTemplate = await prisma.template.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
          });
          activeTemplateKey = defaultTemplate?.key || "eternal-noir";
        }
      }
    } else {
      sendError(
        res,
        "This invitation is not yet active. Please contact the couple for details.",
        403,
        "ORDER_NOT_APPROVED"
      );
      return;
    }

    // Mark viewedAt on first real guest visit (not owner preview)
    if (!guest.viewedAt && !isOwner) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: { viewedAt: new Date() },
      });
    }

    // Return strictly only the fields needed by the invitation page
    sendSuccess(res, {
      invitation: {
        guestName: guest.name,
        brideName: guest.user.brideName,
        groomName: guest.user.groomName,
        venue: invitation?.venue || "Grand Ballroom, Colombo",
        eventDate: invitation?.eventDate || new Date().toISOString(),
        templateKey: activeTemplateKey || "eternal-noir",
        heroImageUrl: invitation?.heroImageUrl || null,
        galleryImages: invitation?.galleryImages || [],
        storyText: invitation?.storyText || null,
        mapUrl: invitation?.mapUrl || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch contact details loaded from backend JSON data file.
 */
export const getContactDetails = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contactDetails = getContactDetailsData();
    sendSuccess(res, contactDetails);
  } catch (error) {
    next(error);
  }
};

