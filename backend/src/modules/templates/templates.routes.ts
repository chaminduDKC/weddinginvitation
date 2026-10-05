import { Router } from "express";
import { getAllTemplates, getTemplateByIdOrKey } from "./templates.controller.js";

const router = Router();

router.get("/", getAllTemplates);
router.get("/:idOrKey", getTemplateByIdOrKey);

export default router;
