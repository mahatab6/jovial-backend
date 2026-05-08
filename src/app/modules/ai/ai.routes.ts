import { Router } from "express";
import { AiController } from "./ai.controller";
import { checkAuth } from "../../middlewares/ckeckAuth";
import { UserRole } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  bulkGenerateContentSchema,
  generateContentSchema,
  updateContentSchema,
} from "./ai.validation";

import { aiGenerationLimiter, dailyAiLimiter } from "../../../config/rateLimiter";

const router = Router();

router.post(
  "/generate",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  aiGenerationLimiter,
  dailyAiLimiter,
  validateRequest(generateContentSchema),
  AiController.generateContent
);

router.post(
  "/generate/bulk",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  aiGenerationLimiter,
  dailyAiLimiter,
  validateRequest(bulkGenerateContentSchema),
  AiController.generateBulk
);

router.post(
  "/regenerate/:id",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  aiGenerationLimiter,
  dailyAiLimiter,
  AiController.regenerate
);


router.get(
  "/",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  AiController.getMyContents
);

router.get(
  "/search",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  AiController.searchContents
);

router.get(
  "/team",
  checkAuth(UserRole.MANAGER, UserRole.ADMIN),
  AiController.getTeamContents
);

router.get(
  "/all",
  checkAuth(UserRole.ADMIN),
  AiController.getAllContents
);

router.get(
  "/:id",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  AiController.getSingleContent
);

router.patch(
  "/:id",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  validateRequest(updateContentSchema),
  AiController.updateContent
);

router.delete(
  "/:id",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  AiController.deleteContent
);

export const aiRoutes = router;