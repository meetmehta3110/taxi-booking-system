import express, { Router } from "express";
const router: Router = express.Router();
import {
  add,
  update,
  get,
  remove,
} from "../../../controllers/product/price/priceController";

router.post("/add", add);
router.post("/update", update);
router.post("/remove", remove);
router.get("/get", get);

export default router;
