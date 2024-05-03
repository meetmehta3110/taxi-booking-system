import express, { Router } from "express";
const   router: Router = express.Router();
import  {get}  from "../../controllers/apiKey/apiKeyController";

router.get('/get', get);


export default router;



