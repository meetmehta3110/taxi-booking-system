import mongoose, { Schema, Document } from "mongoose";
import { server_log } from "../../../constants/constant";

if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${server_log.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface PriceDocument extends Document {
  productId: string;
  stripeProductId: string;
  priceId: string;
  unit_amount: number;
  currency: string;
  interval: number;
}

const PriceSchema: Schema<PriceDocument> = new Schema(
  {
    productId: { type: String, required: true },
    stripeProductId: { type: String, required: true },
    priceId: { type: String, required: true },
    unit_amount: { type: Number, required: true },
    currency: { type: String, required: true },
    interval: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Price = dbConnection.model<PriceDocument>("Price", PriceSchema);
