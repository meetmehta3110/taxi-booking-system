import express, { Router } from "express";
const router: Router = express.Router();
import  serviceRoutes  from "./service";

router.use("/service", serviceRoutes);

export default router;
