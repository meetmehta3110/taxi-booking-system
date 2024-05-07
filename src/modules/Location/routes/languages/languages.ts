import express, { Router } from "express";
const router: Router = express.Router();
import { languages } from "../../controllers/user/languagesController";

router.get("/", languages);

export default router;
