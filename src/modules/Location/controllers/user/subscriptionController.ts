import { validateFields, Field } from "../../../../utils/util";
import { STATUS_CODE, code, STATUS } from "../../../../constants/constant";
import { Request, Response } from "express";
import { UserSubscription } from "../../models/userSubscription.model";
import { User } from "../../models/user.model";
import { Subscription } from "../../models/subscription.model";

import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

export async function list(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "uid", type: "string" }];

    const vali = await validateFields(req, res, requiredFields);
    if (!vali.status) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        status: vali.success,
      });
    }
    const userId = req.body.uid;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.User_not_found, status: STATUS.False });
    }

    const subscriptionIds = user.buySubscriptionList;
    const data = await Subscription.find({ _id: { $in: subscriptionIds } });

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

export async function usage(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "uid", type: "string" }];

    const vali = await validateFields(req, res, requiredFields);
    if (!vali.status) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        status: vali.success,
      });
    }

    const userId = req.body.uid;
    const data = await UserSubscription.findOne({ userId });

    res.status(STATUS_CODE.SUCCESS).json({
      data: data,
      code: code.Login_successful,
      status: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
