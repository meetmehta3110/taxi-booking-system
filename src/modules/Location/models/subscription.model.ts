import mongoose, { Schema, Document } from "mongoose";
import { server_log } from "../../../constants/constant";
if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${server_log.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface SubscriptionDocument extends Document {
  service: {
    productId: mongoose.Schema.Types.ObjectId;
    priceId: mongoose.Schema.Types.ObjectId;
    requestLimit: number;
  }[];
  visible: boolean;
  descriptionns: string;
  subscriptionType: number;
  currency: string;
  symbol: string;
}

const SubscriptionSchema: Schema<SubscriptionDocument> = new Schema(
  {
    service: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        priceId: { type: mongoose.Schema.Types.ObjectId, required: true },
        requestLimit: { type: Number, required: true },
      },
    ],
    visible: { type: Boolean, default: false, required: true },
    subscriptionType: { type: Number, required: true },
    descriptionns: { type: String, default: "" },
    currency: { type: String, default: "" },
    symbol: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Subscription = dbConnection.model<SubscriptionDocument>(
  "Subscription",
  SubscriptionSchema
);
