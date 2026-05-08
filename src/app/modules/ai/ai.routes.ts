import { Router } from "express";
import { AiController } from "./ai.controller";


const router = Router();

router.post("/generate", AiController.generateContent );






export const ContentsRoutes = router;