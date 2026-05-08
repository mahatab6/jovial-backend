import { Router } from "express";
import { AiController } from "./ai.controller";
import { checkAuth } from "../../middlewares/ckeckAuth";
import { UserRole } from "../../generated/prisma/enums";


const router = Router();

router.post(
  "/generate",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN), 
  AiController.generateContent
);

export const aiRoutes = router;