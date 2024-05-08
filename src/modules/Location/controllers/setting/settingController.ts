import { STATUS_CODE, code, STATUS } from "../../../../constants/constant";
import { Request, Response } from "express";
import { Setting } from "../../models/setting.model";
import { validateFields, Field } from "../../../../utils/util";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const data = await Setting.find({});
    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      data: data,
      success: STATUS.True,
    });
  } catch (error) {
    return res.status(500).json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function update(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
      { name: "_id", type: "string" },
      { name: "update", type: "object" },
    ],vali;

     vali = await validateFields(req, res, requiredFields);
    if (!vali.success) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        success: vali.success,
      });
    }
    const { update, _id } = req.body;

    await Setting.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    return res.status(500).json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
