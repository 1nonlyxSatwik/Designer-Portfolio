import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRouter from "./routes/health.js";
import { logger } from "./lib/logger.js";

const app = express();

// Use logger middleware with a robust check for the function
// Vercel/Node ESM can sometimes struggle with pino-http's default export
const pinoHttpMiddleware = (typeof pinoHttp === 'function' 
  ? pinoHttp 
  : (pinoHttp as any).default || (pinoHttp as any).pinoHttp);

app.get("/", (_req: any, res: any) => {
  res.json({ status: "running", message: "Designer Portfolio API Server" });
});

app.use(healthRouter);

if (typeof pinoHttpMiddleware === 'function') {
  app.use(
    (pinoHttpMiddleware as any)({
      logger,
      serializers: {
        req(req: any) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res: any) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;
