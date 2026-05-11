import { Router } from "express";
import { aiRoutes } from "../modules/ai/ai.routes";
import { historyStatsRoutes } from "../modules/history-stats/historyStats.routes";
import { userRoutes } from "../modules/user/user.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { templateRoutes } from "../modules/templates/templates.routes";

const router = Router();

router.use("/ai", aiRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/templates", templateRoutes);
router.use("/", historyStatsRoutes);


export const IndexRoutes = router;