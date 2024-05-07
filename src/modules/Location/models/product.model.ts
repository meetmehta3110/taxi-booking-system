import mongoose, { Schema, Document } from "mongoose";
import { server_log } from "../../../constants/constant";

if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${server_log.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface ProductDocument extends Document {
  name: string;
  productId: string;
  imageUrl: string;
}

const ProductSchema: Schema<ProductDocument> = new Schema(
  {
    name: { type: String , required: true},
    productId: { type: String , required: true},
    imageUrl: { type: String , required: true},
  },
  {
    timestamps: true,
  }
);

export const Product = dbConnection.model<ProductDocument>(
  "Product",
  ProductSchema
);
