import express, { Router } from "express";
const router: Router = express.Router();
import auth from "./auth";
import admin from "./admin";
import { ROUTES } from "../../../../constants/constant";
router.use(`/${ROUTES.User_without_login}/admin`, auth);//any one can access this api

router.use(`/${ROUTES.Admin_services_access}`, admin);//only admin can access this api

export default router;
