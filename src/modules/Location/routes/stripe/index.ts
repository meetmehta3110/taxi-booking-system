import express, { Router } from "express";
const router: Router = express.Router();
import stripe from "./stripe";


router.use("/stripe", stripe);

export default router;
