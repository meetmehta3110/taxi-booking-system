import express, { Router } from "express";
const router: Router = express.Router();
import languages from "./languages";
import { ROUTES } from "../../../../constants/constant";
router.use(`/${ROUTES.languages_access}`, languages);

export default router;
