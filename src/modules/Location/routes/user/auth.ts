import express, { Router } from "express";
const router: Router = express.Router();
import  {register,login}  from "../../controllers/user/authController";

router.post("/register", register);
router.post("/login", login);

export default router;



