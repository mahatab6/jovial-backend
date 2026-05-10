import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminValidation } from "./admin.validation";

const router = Router();

// ALL ROUTES ARE ADMIN ONLY
router.use(checkAuth(UserRole.ADMIN));

router.get(
  "/dashboard",
  AdminController.getDashboardStats
);

router.get(
  "/usage-overview",
  validateRequest(AdminValidation.analyticsQuerySchema),
  AdminController.getUsageOverview
);

router.get(
  "/ai-cost",
  AdminController.getAICostAnalytics
);

router.get(
  "/users",
  validateRequest(AdminValidation.userManagementQuerySchema),
  AdminController.getUsersList
);

export const adminRoutes = router;
