import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { MESSAGE } from "../../../constants/constant";

if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${MESSAGE.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface AdminDocument extends Document {
  username: string;
  email: string;
  phone: string;
  phoneCode: string;
  password: string;
  isApprove: number;
  validPassword(password: string): boolean;
}

const AdminSchema: Schema<AdminDocument> = new Schema(
  {
    username: { type: String, default: "" ,required:true},
    email: { type: String, default: "",required:true },
    phone: { type: String, default: "" ,required:true},
    phoneCode: { type: String, default: "" ,required:true},
    password: { type: String, default: "" ,required:true},
    isApprove: { type: Number, default: 0 ,required:true},
  },
  {
    timestamps: true,
  }
);

AdminSchema.methods.validPassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

export const Admin = dbConnection.model<AdminDocument>("Admin", AdminSchema);
