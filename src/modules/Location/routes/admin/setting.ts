import express, { Router } from "express";
const router: Router = express.Router();
import { get, update } from "../../controllers/setting/settingController";

router.post("/update", update);
router.get("/get", get);

export default router;
