import dotenv from "dotenv";
import { MESSAGE } from "./constants/constant";
// Load environment variables from .env file
dotenv.config({ path: "./env/.env" });

import { connectToDB } from "./config/mongoose";

/**
 * Initializes the application by connecting to MongoDB, setting up Express,
 * and starting the server.
 *
 * @returns {Promise<void>} A Promise that resolves when the initialization process is complete.
 */
const init = async (): Promise<void> => {
  // Connect to MongoDB
  await connectToDB();

  // Import necessary modules
  const { initializeExpress } = await import("./config/express");

  // Initialize Express
  const app = await initializeExpress();

  // Start the server

  if (!process.env.PORT) {
    throw new Error(`PORT ${MESSAGE.Environment_variable_is_not_defined}`);
  }

  const port = process.env.PORT;
  app.listen(port, async () => {
    console.log(MESSAGE.Server_is_running_on_port, port);
  });
};

init();
