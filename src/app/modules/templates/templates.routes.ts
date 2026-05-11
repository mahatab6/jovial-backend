import { Router } from "express";
import { TemplateController } from "./templates.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { TemplateValidation } from "./templates.validation";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.ADMIN),
    validateRequest(TemplateValidation.createTemplateZodSchema),
    TemplateController.createTemplate
);

router.get("/", TemplateController.getAllTemplates);
router.get("/:id", TemplateController.getTemplateById);

router.put(
    "/:id",
    checkAuth(UserRole.ADMIN),
    validateRequest(TemplateValidation.updateTemplateZodSchema),
    TemplateController.updateTemplate
);

router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN),
    TemplateController.deleteTemplate
);

export const templateRoutes = router;
