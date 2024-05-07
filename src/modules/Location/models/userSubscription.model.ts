import mongoose, { Schema, Document } from "mongoose";
import { server_log } from "../../../constants/constant";

if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${server_log.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface UserSubscriptionDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  productId: mongoose.Schema.Types.ObjectId;
  usedLimit: number;
  maxLimit: number;
  startDate: Date;
  endDate: Date;
}

const UserSubscriptionSchema: Schema<UserSubscriptionDocument> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    productId: { type: mongoose.Schema.Types.ObjectId },
    usedLimit: { type: Number, default: 0, required: true },
    maxLimit: { type: Number, default: 0, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserSubscription = dbConnection.model<UserSubscriptionDocument>(
  "UserSubscription",
  UserSubscriptionSchema
);
