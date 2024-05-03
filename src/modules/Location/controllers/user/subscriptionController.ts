import { postRequest } from "../../../../utils/validationUtils";
import { buySubscription } from "../../../../utils/util";
import { STATUS_CODE, MESSAGE, STATUS } from "../../../../constants/constant";
import { Request, Response } from "express";
import { UserSubscription } from "../../models/userSubscription.model";
import { User } from "../../models/user.model";
import { Subscription } from "../../models/subscription.model";

import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });
interface Field {
  name: string;
  type: "string" | "number" | "boolean"; // Adjust as needed for other types
}

export async function list(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "uid", type: "string" }];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        message: validationResult.errorResponse?.message,
        success: validationResult.errorResponse?.success,
      });
    }

    const userId = req.body.uid;
    let SubscriptionIdList = await User.findOne(
      { _id: userId },
      { buySubscriptionList: 1 }
    );
    console.log(SubscriptionIdList?.buySubscriptionList);
    const data = Subscription.findOne({
      _id: { $in: SubscriptionIdList?.buySubscriptionList },
    });

    return res.status(STATUS_CODE.SUCCESS).json({
      message: MESSAGE.Request_process_successfully,
      data: data,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ message: MESSAGE.Internal_server_error, success: STATUS.False }); // Added internal server error response code
  }
}

export async function usage(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "uid", type: "string" }];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        message: validationResult.errorResponse?.message,
        success: validationResult.errorResponse?.success,
      });
    }

    const userId = req.body.uid;
    const data = await UserSubscription.findById({ userId });
    res.status(STATUS_CODE.SUCCESS).json({
      data: data,
      message: MESSAGE.Login_successful,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.ERROR)
      .json({ message: MESSAGE.Internal_server_error, success: STATUS.False });
  }
}
