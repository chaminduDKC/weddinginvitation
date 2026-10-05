import { Router } from "express";
import { getPublicInvitation } from "./public.controller.js";

const router = Router();

// Public route for guests
router.get("/invitations/:token", getPublicInvitation);

export default router;
