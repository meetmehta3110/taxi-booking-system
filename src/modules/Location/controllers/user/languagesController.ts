import {
  STATUS_CODE,
  code,
  STATUS,
} from "../../../../../src/constants/constant";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { Languages } from "../../models/languages.model";

dotenv.config({ path: "../../../../../env/.env" });

export async function languages(req: Request, res: Response): Promise<any> {
  try {
    const languages = await Languages.find({});
    return res.status(STATUS_CODE.SUCCESS).json({ languages });
  } catch (err) {
    console.log(err);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
