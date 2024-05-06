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

export interface UserDocument extends Document {
  username: string;
  email: string;
  phone: string;
  phoneCode: string;
  password: string;
  isApprove: number;
  api_key: string;
  stripeCustomerId: string;
  twillo: {
    twilio_account_sid: string;
    twilio_auth_token: string;
    twilio_number: string;
    twiml_url: string;
  };
  isLogin: boolean;
  buySubscriptionList: {
    subscriptionId: mongoose.Schema.Types.ObjectId;
    paymentStatus: number;
    stripesubscriptionId: string;
  }[];
  validPassword(password: string): boolean; // Define the custom method
}

const UserSchema: Schema<UserDocument> = new Schema(
  {
    username: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    phone: { type: String, default: "", required: true },
    phoneCode: { type: String, default: "", required: true },
    password: { type: String, default: "", required: true },
    isApprove: { type: Number, default: 1, required: true },
    api_key: { type: String, default: "" },
    stripeCustomerId: { type: String, default: "" },
    twillo: {
      type: {
        twilio_account_sid: { type: String, default: "" },
        twilio_auth_token: { type: String, default: "" },
        twilio_number: { type: String, default: "" },
        twiml_url: { type: String, default: "" },
      },
      default: {
        twilio_account_sid: "",
        twilio_auth_token: "",
        twilio_number: "",
        twiml_url: "",
      },
    },
    buySubscriptionList: [
      {
        subscriptionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        paymentStatus: { type: Number, required: true },
        stripesubscriptionId: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.validPassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

export const User = dbConnection.model<UserDocument>("User", UserSchema);
