import express, { Router } from "express";
const router: Router = express.Router();
import uploads from "./uploads";
import { ROUTES } from "../../../../constants/constant";

router.use(`/${ROUTES.Images_access}`, uploads);

export default router;
