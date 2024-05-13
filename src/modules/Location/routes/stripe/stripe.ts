import express, { Router } from "express";
const router: Router = express.Router();
import { webhook } from "../../controllers/stripe/stripeController";

router.post("/webhook", webhook);

export default router;
