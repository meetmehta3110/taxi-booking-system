import {
  STATUS_CODE,
  MESSAGE,
  STATUS,
  JWT,
} from "../../../../../src/constants/constant";
import { Request, Response } from "express";
import { User } from "../../models/user.model";
import { getRequest } from "../../../../../src/utils/validationUtils";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

interface Field {
  name: string;
  type: "string" | "number" | "boolean"; // Adjust as needed for other types
}

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "uid", type: "string" }];

    const validationResult = getRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        message: validationResult.errorResponse?.message,
        success: validationResult.errorResponse?.success,
      });
    }

    const uid = req.query["uid"];
    let data = await User.findOne({ _id: uid }, { api_key: 1 });
    if (!data) {
      throw new Error(MESSAGE.User_not_found);
    }
    let api_key = data.api_key;
    if (api_key != "") {
      return res.status(201).json({ api_key, success: true });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error(
        `SECRET_KEY ${MESSAGE.Environment_variable_is_not_defined}`
      );
    }
    api_key = jwt.sign(
      { uid: uid, type: JWT.services },
      process.env.JWT_SECRET
    );
    await User.findByIdAndUpdate({ _id: uid }, { api_key });
    return res
      .status(STATUS_CODE.SUCCESS)
      .json({ api_key, success: STATUS.True });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ message: MESSAGE.Internal_server_error, success: STATUS.False });
  }
}
