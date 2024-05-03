import express, { Router } from "express";
const router: Router = express.Router();
import {
  list,
  usage,
} from "../../controllers/user/subscriptionController";

router.post("/buyList", list);

router.post("/usage", usage);


export default router;
