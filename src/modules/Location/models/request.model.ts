import mongoose, { Schema, Document } from "mongoose";
import { MESSAGE } from "../../../constants/constant";
if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${MESSAGE.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface RequestDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  productId: mongoose.Schema.Types.ObjectId;
  requTime: Date;
  resTime: Date;
  status: boolean;
  descriptionns: string;
}

const UserSchema: Schema<RequestDocument> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    requTime: { type: Date, required: true },
    resTime: { type: Date, required: true },
    status: { type: Boolean, required: true },
    descriptionns: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Request = dbConnection.model<RequestDocument>(
  "Request",
  UserSchema
);
