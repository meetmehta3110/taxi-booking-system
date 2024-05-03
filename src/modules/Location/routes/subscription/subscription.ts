import express, { Router } from "express";
const router: Router = express.Router();
import { get } from "../../controllers/subscription/subscriptionController";

router.get("/get", get);

export default router;
