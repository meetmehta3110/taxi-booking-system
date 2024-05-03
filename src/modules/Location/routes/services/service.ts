import express, { Router } from "express";
const   router: Router = express.Router();
import  {add,get}  from "../../controllers/services/serviceController";

router.post('/add', add);

router.get('/get', get);

export default router;



