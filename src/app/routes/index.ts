import { Router } from "express";
import { ContentsRoutes } from "../modules/ai/ai.routes";

const router = Router();

router.use("/contents", ContentsRoutes)


export const IndexRoutes = router;