import express, { Router } from "express";
const router: Router = express.Router();
import { ROUTES } from "../../../../constants/constant";
import request from "./request";
router.use(`/${ROUTES.User_services_access}`, request); //only product services can acces this routes

export default router;
