import mongoose, { Schema, Document } from "mongoose";
import { server_log } from "../../../constants/constant";

if (!process.env.LOCATION_DB_URI) {
  throw new Error(
    `LOCATION_DB_URI ${server_log.Environment_variable_is_not_defined}`
  );
}

const uri = process.env.LOCATION_DB_URI;
const dbConnection = mongoose.createConnection(uri);

export interface LanguagesDocument extends Document {
  name: string;
  languageJson: object;
  code: string;
  userVisibility: boolean;
}

const LanguagesSchema: Schema<LanguagesDocument> = new Schema(
  {
    name: { type: String },
    languageJson: { type: Object, default: {} },
    code: { type: String },
    userVisibility: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

export const Languages = dbConnection.model<LanguagesDocument>(
  "Languages",
  LanguagesSchema
);
