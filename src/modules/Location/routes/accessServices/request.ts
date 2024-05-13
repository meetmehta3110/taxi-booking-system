import express, { Router } from "express";
const router: Router = express.Router();
import { twilioSendSms } from "../../controllers/request/requestController";

router.post("/twilio", twilioSendSms);

export default router;

