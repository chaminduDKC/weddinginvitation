import { Router } from "express";
import {
  getUserOrders,
  createOrder,
  getOrderStatusForTemplate,
} from "./orders.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { uploadSlipMiddleware } from "../../middleware/upload.js";

const router = Router();

// All order routes require authentication
router.use(requireAuth);

router.get("/", getUserOrders);
router.get("/template/:templateId", getOrderStatusForTemplate);
router.post("/", uploadSlipMiddleware.single("slip"), createOrder);

export default router;
