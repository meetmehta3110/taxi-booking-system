import express, { Router } from "express";
const router: Router = express.Router();
import {
  add,
  get,
  update,
  remove,
} from "../../controllers/subscription/subscriptionController";

router.post("/add", add);
router.post("/update", update);
router.post("/remove", remove);
router.get("/get", get);

export default router;
