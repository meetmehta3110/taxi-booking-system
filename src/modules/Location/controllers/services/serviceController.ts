import {
  STATUS_CODE,
  code,
  STATUS,
  SERVICES,
} from "../../../../../src/constants/constant";
import { Request, Response } from "express";
import { User } from "../../models/user.model";
import {
  postRequest,
  getRequest,
} from "../../../../../src/utils/validationUtils";

import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

interface Field {
  name: string;
  type: "string" | "number" | "boolean"; // Adjust as needed for other types
}

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "uid", type: "string" },
      { name: "service", type: "string" },
    ];

    const validationResult = getRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }

    const uid = req.query["uid"];
    const service: number = parseInt(req.query["service"] as string);
    let find: any = {};
    let options: any = {};
    if (service >= SERVICES.Min_services && service <= SERVICES.Max_services) {
      if (service === SERVICES.Twillo) {
        find = { _id: uid };
        options = { twillo: 1 };
      }
      const data = await User.findOne(find, options);
      return res.status(STATUS_CODE.SUCCESS).json({
        data: data,
        code: code.Request_process_successfully,
        status: STATUS.True,
      });
    } else {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Invalid_request, status: STATUS.False });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function add(req: Request, res: Response): Promise<any> {
  let requiredFields: Field[] = [{ name: "service", type: "number" }];
  console.log("hello babay");

  const validationResult = postRequest(req, res, requiredFields);

  if (!validationResult.valid) {
    return res.status(validationResult.errorResponse?.status_code ?? 200).json({
      code: validationResult.errorResponse?.code,
      status: validationResult.errorResponse?.status,
    });
  }

  let service: number = req.body.service;
  let update: any = {};
  let uid: string = "";

  if (service >= SERVICES.Min_services && service <= SERVICES.Max_services) {
    if (service === SERVICES.Twillo) {
      const {
        twilio_auth_token,
        twilio_account_sid,
        twilio_number,
        twiml_url,
      } = req.body;
      requiredFields = [
        { name: "twilio_auth_token", type: "string" },
        { name: "twilio_account_sid", type: "string" },
        { name: "twilio_number", type: "string" },
        { name: "twiml_url", type: "string" },
        { name: "uid", type: "string" },
      ];
      update = {
        twillo: {
          twilio_auth_token,
          twilio_account_sid,
          twilio_number,
          twiml_url,
        },
      };
    }

    const validationResult = postRequest(req, res, requiredFields);
    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }
  } else {
    return res
      .status(STATUS_CODE.SUCCESS)
      .json({ code: code.Invalid_request, status: STATUS.False });
  }

  uid = req.body.uid;
  await User.findByIdAndUpdate({ _id: uid }, update);
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ code: code.Detail_add_successfully, status: STATUS.True });
}
