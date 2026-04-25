import { Router } from "express";
import healthRouter from "./health.js";

const router = Router();

router.use(healthRouter);

export default router;
