import express, { Router } from "express";
const router: Router = express.Router();
import auth from "./auth";
import subscription from "./subscription";
import card from "./card";
import userSetting from "./userSetting";
import { ROUTES } from "../../../../constants/constant";
router.use(`/${ROUTES.User_without_login}`, auth);

router.use("/subscription", subscription);

router.use("/card", card);

router.use("/setting",userSetting);
export default router;
