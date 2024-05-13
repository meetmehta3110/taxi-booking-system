import express, { Router } from "express";
import {createCheckoutSession} from '../../controllers/stripe/stripeController'
const router: Router = express.Router();
import {
  list,
  usage,
  cancel
} from "../../controllers/user/subscriptionController";

router.get("/buyList", list);

router.get("/usage", usage);

router.post("/create-checkout-session", createCheckoutSession);

router.post("/cancel", cancel);

export default router;
