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
      status: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function userSettng(req: Request, res: Response): Promise<any> {
  try {
    const data = await Setting.findOne({},{stripe_publishable_key:1});
    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      data: data,
      status: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}


export async function update(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
        { name: "_id", type: "string" },
        { name: "update", type: "object" },
      ],
      vali;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.status) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        status: vali.success,
      });
    }
    const { update, _id } = req.body;

    await Setting.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
