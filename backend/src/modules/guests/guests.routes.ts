import { Router } from "express";
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from "./guests.controller.js";
import { createGuestSchema, updateGuestSchema } from "./guests.schema.js";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

const router = Router();

// All guest management routes require authentication
router.use(requireAuth);

router.get("/", getGuests);
router.post("/", validateBody(createGuestSchema), createGuest);
router.patch("/:id", validateBody(updateGuestSchema), updateGuest);
router.delete("/:id", deleteGuest);

export default router;
