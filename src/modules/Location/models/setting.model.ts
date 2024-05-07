import mongoose, { Schema, Document } from "mongoose";
import { server_log } from "../../../constants/constant";

if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${server_log.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface SettingnDocument extends Document {
  stripe_secret_key: string;
  stripe_publishable_key: string;
  port: number;
  serverUrl: string;
  protocol: string;
  defaulImageFolder: string;
  paymentCancelUrl: string;
  paymentSuccessUrl: string;
}

const SettingSchema: Schema<SettingnDocument> = new Schema(
  {
    stripe_secret_key: { type: String, default: "" },
    stripe_publishable_key: { type: String, default: "" },
    port: { type: Number, required: true },
    serverUrl: { type: String, default: "", required: true },
    protocol: { type: String, default: "", required: true },
    defaulImageFolder: { type: String, default: "", required: true },
    paymentSuccessUrl: { type: String, default: "", required: true },
    paymentCancelUrl: { type: String, default: "", required: true },
  },
  {
    timestamps: true,
  }
);

export const Setting = dbConnection.model<SettingnDocument>(
  "Setting",
  SettingSchema
);
