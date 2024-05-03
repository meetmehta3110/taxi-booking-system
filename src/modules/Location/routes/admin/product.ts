import express, { Router } from "express";
import { upload } from "../../../../utils//util";
import price from "./price";
const router: Router = express.Router();
import {
  add,
  get,
  update,
  remove,
} from "../../controllers/product/crudProductController";

router.post("/add", upload.single("file"), add);
router.post("/update", update);
router.post("/remove", remove);
router.get("/get", get);

router.use("/", price);
export default router;
