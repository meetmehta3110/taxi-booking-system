import express, { Router } from "express";
const router: Router = express.Router();
import product from "./product";
import subscription from "./subscription";
import setting from "./setting";

router.use("/product", product);

router.use("/subscription", subscription);

router.use("/setting", setting);

export default router;
