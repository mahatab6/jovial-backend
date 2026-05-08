import express, { Application, Request, Response } from 'express'
import { envVariable } from './config/env'
import cors from "cors";
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './app/routes';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';
import { requestLogger } from './app/middlewares/logger.middleware';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';

const app: Application = express()

app.use(
  cors({
    origin: ["http://localhost:3000", envVariable.FRONTEND_URL],
    credentials: true,
  })
);

app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", IndexRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Jovial AI backend running ')
})

app.use(globalErrorHandler);

export default app;