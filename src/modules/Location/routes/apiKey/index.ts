import express, { Router } from "express";
const router: Router = express.Router();
import  apikeyRoutes  from "./apiKey";

router.use("/apikey", apikeyRoutes);

export default router;
