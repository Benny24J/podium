import { Router, type IRouter } from "express";
import healthRouter from "./health";
import podiumRouter from "./podium";

const router: IRouter = Router();

router.use(healthRouter);
router.use(podiumRouter);

export default router;
