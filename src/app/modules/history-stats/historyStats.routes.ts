import { Router } from "express";
import { HistoryStatsController } from "./historyStats.controller";
import { checkAuth } from "../../middlewares/ckeckAuth";
import { UserRole } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { HistoryStatsValidation } from "./historyStats.validation";

const router = Router();

// HISTORY ROUTES
router.get(
  "/history",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  validateRequest(HistoryStatsValidation.historyQuerySchema),
  HistoryStatsController.getPersonalHistory
);

router.get(
  "/history/team",
  checkAuth(UserRole.MANAGER, UserRole.ADMIN),
  validateRequest(HistoryStatsValidation.historyQuerySchema),
  HistoryStatsController.getTeamHistory
);

router.get(
  "/history/all",
  checkAuth(UserRole.ADMIN),
  validateRequest(HistoryStatsValidation.historyQuerySchema),
  HistoryStatsController.getAllHistory
);

// STATS ROUTES
router.get(
  "/stats/usage",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  validateRequest(HistoryStatsValidation.analyticsQuerySchema),
  HistoryStatsController.getPersonalUsageStats
);

router.get(
  "/stats/team",
  checkAuth(UserRole.MANAGER, UserRole.ADMIN),
  validateRequest(HistoryStatsValidation.analyticsQuerySchema),
  HistoryStatsController.getTeamAnalytics
);

router.get(
  "/stats/global",
  checkAuth(UserRole.ADMIN),
  HistoryStatsController.getGlobalAnalytics
);

router.get(
  "/stats/content-type",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  HistoryStatsController.getContentTypeDistribution
);

router.get(
  "/stats/model-usage",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  HistoryStatsController.getModelUsageAnalytics
);

export const historyStatsRoutes = router;
