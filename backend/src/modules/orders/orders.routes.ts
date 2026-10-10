import { Router } from "express";
import {
  getUserOrders,
  createOrder,
  getOrderStatusForTemplate,
  getBankDetails,
} from "./orders.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { uploadSlipMiddleware } from "../../middleware/upload.js";

const router = Router();

// Bank details endpoint (accessible publicly or authenticated)
router.get("/bank-details", getBankDetails);

// All protected order routes require authentication
router.use(requireAuth);

router.get("/", getUserOrders);
router.get("/template/:templateId", getOrderStatusForTemplate);
router.post("/", uploadSlipMiddleware.single("slip"), createOrder);

export default router;
