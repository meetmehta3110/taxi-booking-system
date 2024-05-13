import { postRequest } from "../../../../../src/utils/validationUtils";
import {
  STATUS_CODE,
  code,
  STATUS,
  SERVICES,
  message_db,
  product
} from "../../../../../src/constants/constant";
import { Request, Response } from "express";
import { User } from "../../models/user.model";
import { UserSubscription } from "../../models/userSubscription.model";
import twilio from "twilio";
import { addIntoRequest, checkSubscriptions } from "../../../../utils/util";

import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

interface Field {
  name: string;
  type: "string" | "number" | "boolean"; // Adjust as needed for other types
}

export async function twilioSendSms(req: Request, res: Response): Promise<any> {
  try {
    const requTime: Date = new Date();

    const productId = product.twillo; // Assuming SERVICES.Twillo is defined elsewhere

    const uid = req.body.uid;

    let resTime: Date;
    let status: number;
    let descriptionns: string;
    let add: any = {};

    const Subscriptions = await checkSubscriptions(uid, productId); // this function return lenth if length is one then user buy the Subscriptions else not
    if (Subscriptions != 1) {
      resTime = new Date();
      status = STATUS.False;
      descriptionns = message_db.Your_subscriptions_is_over;
      add = {
        userId: uid,
        productId,
        requTime,
        resTime,
        status,
        descriptionns,
      };
      await addIntoRequest(add);
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Your_subscriptions_is_over, status: STATUS.False });
    }
    await UserSubscription.findOneAndUpdate(
      { userId: uid, productId },
      { $inc: { usedLimit: SERVICES.Inc_Usage } }
    );

    const requiredFields: Field[] = [
      { name: "msg", type: "string" },
      { name: "to", type: "string" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }

    const { to, msg } = req.body;
    const user = await User.findOne({ _id: uid }, { twillo: 1 });

    if (!user) {
      return res
        .status(STATUS_CODE.ERROR)
        .json({ code: code.User_not_found, status: STATUS.False });
    }

    const twilio_account_sid = user.twillo.twilio_account_sid;
    const twilio_auth_token = user.twillo.twilio_auth_token;
    const twilio_number = user.twillo.twilio_number;

    if (twilio_account_sid && twilio_auth_token && twilio_number) {
      const client = twilio(twilio_account_sid, twilio_auth_token);

      client.messages.create(
        {
          body: msg,
          to: to,
          from: twilio_number,
        },
        async function (err: any) {
          let resTime = new Date();
          let status: any;
          let descriptionns: any;
          let add: any = {
            userId: uid,
            requTime: new Date(),
            resTime,
          };

          if (err) {
            console.log(err);
            status = STATUS.False;
            descriptionns = err;
            add.status = status;
            add.descriptionns = descriptionns;
            await addIntoRequest(add);
            return res.status(STATUS_CODE.ERROR).json({
              code: code.Internal_server_error,
              status: STATUS.False,
            });
          } else {
            status = STATUS.True;
            descriptionns = message_db.Sms_send_successfully;
            add.status = status;
            add.descriptionns = descriptionns;
            add.userId = uid;
            add.productId = productId;
            add.resTime = new Date();
            add.requTime = requTime;
            await addIntoRequest(add);
            return res
              .status(STATUS_CODE.SUCCESS)
              .json({ code: code.Sms_send_successfully, status: STATUS.True });
          }
        }
      );
    } else {
      return res.status(STATUS_CODE.ERROR).json({
        code: code.Twilio_credentials_not_found,
        status: STATUS.False,
      });
    }
  } catch (error) {
    //if server error then request time and response time both are sem
    console.log(error);
    const productId = req.path.substring(1); // Assuming SERVICES.Twillo is defined elsewhere
    let requTime = new Date();
    let resTime = new Date();
    let status = STATUS.False;
    let descriptionns = error;
    let uid = req.body.uid;
    let add = {
      userId: uid,
      productId,
      requTime,
      resTime,
      status,
      descriptionns,
    };
    await addIntoRequest(add);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
