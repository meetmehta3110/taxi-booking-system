import express, { Router } from "express";
const router: Router = express.Router();
import { twilioSendSms } from "../../controllers/request/requestController";
import { Product } from "../../models/product.model";

async function addRoutes(): Promise<void> {
  const routes = await routesList(); // Wait for routesList function to complete

  for (const route of routes) {
    router.post(`/${route._id}`, twilioSendSms);
  }
}

// router.post("/twilio", twilioSendSms);

export default router;

async function routesList(): Promise<any> {
  const routes = await Product.find({});
  return routes;
}

// Call addRoutes function to add routes to the router
addRoutes();
