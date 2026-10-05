import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getAdminOrders,
  reviewOrder,
  getAdminUsers,
  toggleUserStatus,
  deleteUser,
  getAdminTemplates,
  updateTemplate,
  uploadTemplateThumbnail,
} from "./admin.controller.js";
import {
  reviewOrderSchema,
  toggleUserStatusSchema,
  updateTemplateSchema,
} from "./admin.schema.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { uploadThumbnailMiddleware } from "../../middleware/upload.js";

const router = Router();

// Strict administrative authentication
router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

// Template Management (Names, Thumbnails, Pricing, Status)
router.get("/templates", getAdminTemplates);
router.patch("/templates/:id", validateBody(updateTemplateSchema), updateTemplate);
router.post(
  "/templates/:id/thumbnail",
  uploadThumbnailMiddleware.single("thumbnail"),
  uploadTemplateThumbnail
);

// Order Management
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/review", validateBody(reviewOrderSchema), reviewOrder);

// User Management
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", validateBody(toggleUserStatusSchema), toggleUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
