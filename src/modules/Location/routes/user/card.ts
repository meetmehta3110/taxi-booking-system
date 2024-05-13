import express, { Router } from "express";
const router: Router = express.Router();
import  {add,get,remove,setdefault}  from "../../controllers/user/cardController";

router.post("/add", add);
router.post("/get", get);
router.post("/remove", remove);
router.post("/setdefault", setdefault);

export default router;

