import { postRequest } from "../../../../../src/utils/validationUtils";
import {
  STATUS_CODE,
  code,
  STATUS,
  server_log,
} from "../../../../../src/constants/constant";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { Setting, SettingnDocument } from "../../models/setting.model";
import { error } from "console";
import {
  addTestCardToCustomer,
  getAllCards,
  deleteCard,
  changeDefaultCard,
} from "../../../../utils/util";
dotenv.config({ path: "../../../../../env/.env" });
interface Field {
  name: string;
  type: "string" | "number" | "boolean"; // Adjust as needed for other types
}



export async function remove(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
      { name: "stripeCustomerId", type: "string" },
      { name: "stripeCardId", type: "string" },
    ],validationResult;

   
    validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }

    const { stripeCustomerId, stripeCardId } = req.body;

    deleteCard(stripeCustomerId, stripeCardId)
      .then((deletedCard) => {
        return res
          .status(STATUS_CODE.SUCCESS)
          .json({ code: code.Card_deleted, status: STATUS.True });
      })
      .catch((error) => {
        console.log(error);
        return res.status(STATUS_CODE.ERROR).json({
          code: code.Internal_server_error,
          status: STATUS.False,
        });
      });
  } catch (err) {
    console.log(err);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function setdefault(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
      { name: "stripeCustomerId", type: "string" },
      { name: "stripeCardId", type: "string" },
    ],validationResult;

    
    validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }

    const { stripeCustomerId, stripeCardId } = req.body;

    await changeDefaultCard(stripeCustomerId, stripeCardId);

    return res.status(200).json({
      code: code.change_defaul_card,
      status: STATUS.True,
    });
  } catch (err) {
    console.log(err);

    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function get(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
      { name: "stripeCustomerId", type: "string" },
    ],validationResult;

    
    validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }
    const stripeCustomerId = req.body.stripeCustomerId;
    getAllCards(stripeCustomerId).then(async (cards) => {
      const setting: SettingnDocument | null = await Setting.findOne({});
      if (!setting) {
        throw error(server_log.Add_stript_key);
      }
      const stripe = require("stripe")(setting.stripe_secret_key);

      const customer = await stripe.customers.retrieve(stripeCustomerId);
      const isDefaultCard = customer.default_source;
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Request_process_successfully,
        data: { cards: cards, defaultCard: isDefaultCard },
        status: STATUS.True,
      });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False }); // Added internal server error response code
  }
}

export async function add(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
      { name: "stripeCustomerId", type: "string" },
        { name: "token", type: "string" },
    ],validationResult;

    
    validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status_code ?? 200).json({
        code: validationResult.errorResponse?.code,
        status: validationResult.errorResponse?.status,
      });
    }

    const {stripeCustomerId,token} = req.body;
    let card = await addTestCardToCustomer(stripeCustomerId,token);
    if (card) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Request_process_successfully,
        data: card,
        status: STATUS.True,
      });
    } else {
      return res.status(422).json({
        code: code.Internal_server_error,
        status: STATUS.False,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
