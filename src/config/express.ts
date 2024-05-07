import express, { Application } from "express";
import bodyParser from "body-parser";
import { commonMiddleware } from "../middleware/common.middleware";
import routes from "../modules/Location/routes/index";
import cors from "cors";
import helmet from "helmet";

export const initializeExpress = async (): Promise<express.Application> => {
  const app: Application = express();

  // Allow all origins, methods, and headers
  app.use(
    cors({
      origin: "*",
      exposedHeaders: ["id", "Authorization"],
    })
  );

  // Using helmet.js for enhanced security
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  // Increase payload size limit (e.g., 10MB)
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

  // Apply common middleware to all routes
  app.use(commonMiddleware);

  // Routes

  app.set("trust proxy", 1);

  app.use("/", routes);

  return app;
};
