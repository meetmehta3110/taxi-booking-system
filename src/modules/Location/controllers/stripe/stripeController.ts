const ObjectId = require("mongodb").ObjectId;
import {
  STATUS_CODE,
  code,
  STATUS,
  server_log,
  stripe_status,
} from "../../../../constants/constant";
import { Request, Response } from "express";
import {
  Subscription,
  SubscriptionDocument,
} from "../../models/subscription.model";
import { postRequest } from "../../../../utils/validationUtils";
import dotenv from "dotenv";
import { Price, PriceDocument } from "../../models/price.model";
import { Setting, SettingnDocument } from "../../models/setting.model";
import { error } from "console";
import { User, UserDocument } from "../../models/user.model";
import { buySubscription, getAllCards } from "../../../../utils/util";
dotenv.config({ path: "../../../../../env/.env" });
interface Field {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // Adjust as needed for other types
}

export async function createCheckoutSession(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "sid", type: "string" }];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res
        .status(validationResult.errorResponse?.status_code ?? 200)
        .json({
          code: validationResult.errorResponse?.code,
          status: validationResult.errorResponse?.status,
        });
    }

    let items: any = [];
    const { sid, uid } = req.body;

    const subscription: SubscriptionDocument | null =
      await Subscription.findOne({ _id: sid });

    if (!subscription) {
      console.log(server_log.Envalide_subscription);

      throw error(server_log.Envalide_subscription);
    }

    const findCard: UserDocument | null = await User.findOne(
      { _id: uid },
      { _id: 0, stripeCustomerId: 1 }
    );

    if (!findCard) {
      return res.status(STATUS_CODE.ERROR).json({
        code: code.User_not_found,
        status: STATUS.False,
      });
    }
    console.log(sid);

    const findSubscription: UserDocument | null = await User.findOne(
      {
        _id: uid,
        "buySubscriptionList.subscriptionId": sid,
      },
      { _id: 1 }
    );

    if (findSubscription) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.You_allReady_have_this_subscriptions,
        status: STATUS.False,
      });
    }

    const getCard = await getAllCards(findCard.stripeCustomerId);

    if (getCard.length == 0) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Pleace_add_card_first,
        status: STATUS.False,
      });
    }
    const promises = subscription.service.map(async (subscription: any) => {
      const price: PriceDocument | null = await Price.findById(
        { _id: subscription.priceId },
        { _id: 0, priceId: 1 }
      );

      if (!price) {
        throw error(server_log.Envalide_priceId);
      }

      items.push({
        price: price.priceId,
        quantity: subscription.requestLimit,
      });
    });

    await Promise.all(promises);

    const user: UserDocument | null = await User.findById(
      { _id: uid },
      { stripeCustomerId: 1, _id: 0 }
    );
    if (!user) {
      return res
        .status(STATUS_CODE.ERROR)
        .json({ code: code.User_not_found, status: STATUS.False });
    }

    const setting: SettingnDocument | null = await Setting.findOne({});
    if (setting && setting.stripe_secret_key != "") {
      const stripe = require("stripe")(setting.stripe_secret_key);

      const session = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items,
        metadata: {
          subscriptionId: sid,
          uid: uid,
        },
      });

      // get id, save to user, return url
      const stripesubscriptionId = session.id;

      // save session.id to the user in your database

      const newSubscription = {
        subscriptionId: sid,
        stripesubscriptionId,
        paymentStatus: 0,
      };
      await User.findByIdAndUpdate(
        { _id: uid },
        { $push: { buySubscriptionList: newSubscription } }
      );

      res.status(STATUS_CODE.SUCCESS).json({
        code: code.Subscription_Buy_Successfully,
        status: STATUS.True,
      });
    } else {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Add_stript_key, status: STATUS.False });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function webhook(req: Request, res: Response): Promise<any> {
  try {
    const payload = req.body;
    const payloadType = payload.type;
    const status = payload.data.object.status;
    const StripeSubscriptionId = payload.data.object.subscription;
    const subscriptionId =
      payload.data.object.subscription_details.metadata.subscriptionId;
    const uid = payload.data.object.subscription_details.metadata.uid;
    if (
      payloadType == stripe_status.payloadType &&
      status == stripe_status.status
    ) {
      const query = {
        _id: uid,
        "buySubscriptionList.stripesubscriptionId": StripeSubscriptionId,
      };

      // Define the update operation
      const update = {
        $inc: { "buySubscriptionList.$.paymentStatus": 1 }, // Increment paymentStatus by 1 for the matched subscription
      };

      await buySubscription(uid, subscriptionId);
      await User.findOneAndUpdate(query, update);
      res.status(200).end();
    }
  } catch (err) {
    console.log(err);

    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
