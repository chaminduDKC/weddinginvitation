import { Router } from "express";
import {
  getUserInvitations,
  getInvitationByTemplate,
  upsertInvitation,
} from "./invitations.controller.js";
import { upsertInvitationSchema } from "./invitations.schema.js";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

const router = Router();

// All invitation routes require authentication
router.use(requireAuth);

router.get("/", getUserInvitations);
router.get("/template/:templateId", getInvitationByTemplate);
router.post("/", validateBody(upsertInvitationSchema), upsertInvitation);

export default router;
