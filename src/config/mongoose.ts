import mongoose from "mongoose";
import dotenv from "dotenv";
import { server_log } from "../constants/constant";
import { initialData } from "../utils/util";
// Load environment variables from .env file
dotenv.config();

// MongoDB connection function
export const connectToDB = async (): Promise<typeof mongoose> => {
  try {
    if (!process.env.LOCATION_DB_URI) {
      throw new Error(
        `LOCATION_DB_URI  ${server_log.Environment_variable_is_not_defined}`
      );
    }

    const uri = process.env.LOCATION_DB_URI; //Mongodb url
    console.log(uri);

    const dbConnection = await mongoose.connect(uri); //Mongodb Connectd Successfully
    await initialData();
    return dbConnection;
  } catch (error) {
    console.log(server_log.MongoDB_connection_error, error);
    process.exit(1); // Exit process with failure
  }
};
