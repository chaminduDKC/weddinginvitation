import { Router } from "express";
import { getPublicInvitation, getContactDetails } from "./public.controller.js";
import { getBankDetails } from "../orders/orders.controller.js";

const router = Router();

// Public routes
router.get("/invitations/:token", getPublicInvitation);
router.get("/bank-details", getBankDetails);
router.get("/contact-details", getContactDetails);

export default router;
