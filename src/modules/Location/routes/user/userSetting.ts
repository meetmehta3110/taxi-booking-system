import express, { Router } from "express";
const router: Router = express.Router();
import  {userSettng}  from "../../controllers/setting/settingController";


router.get("/userSettng", userSettng);


export default router;