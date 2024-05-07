import express, { Router } from "express";
const router: Router = express.Router();
import userRoutes from "./user/index";
import accessServiceRoutes from "./accessServices";
import serviceRoutes from "./services";
import apikeyRoutes from "./apiKey";
import subscription from "./subscription";
import admin from "./admin";
import images from "./images";
import stripe from "./stripe";
import languages from "./languages";


router.use("/", userRoutes);
router.use("/", serviceRoutes);
router.use("/", accessServiceRoutes);
router.use("/", apikeyRoutes);
router.use("/", subscription);
router.use("/", admin);
router.use("/", images);
router.use("/", stripe);
router.use("/", languages);
export default router;
