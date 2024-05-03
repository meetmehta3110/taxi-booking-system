import express, { Router } from "express";
const router: Router = express.Router();
import {
  createCheckoutSession,
  webhook
} from "../../controllers/stripe/stripeController";

router.post("/create-checkout-session", createCheckoutSession);

router.post("/webhook", webhook);



export default router;
