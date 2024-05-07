import { STATUS_CODE, code, STATUS } from "../../../../constants/constant";
import { Request, Response } from "express";
import { Setting } from "../../models/setting.model";
import { postRequest } from "../../../../utils/validationUtils";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

interface Field {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // Adjust as needed for other types
}

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const data = await Setting.find({});
    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      data: data,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function update(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "_id", type: "string" },
      { name: "update", type: "object" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        code: validationResult.errorResponse?.code,
        success: validationResult.errorResponse?.success,
      });
    }

    const { update, _id } = req.body;

    await Setting.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
