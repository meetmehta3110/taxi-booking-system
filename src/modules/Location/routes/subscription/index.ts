import express, { Router } from "express";
const router: Router = express.Router();
import subscription from "./subscription";

router.use("/subscription", subscription);

export default router;
