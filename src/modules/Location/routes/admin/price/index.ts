import express, { Router } from "express";
const router: Router = express.Router();
import price from "./price";


router.use("/price", price);

export default router;
