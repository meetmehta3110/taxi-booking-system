import { STATUS_CODE, MESSAGE, STATUS } from "../../../../constants/constant";
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
import { buySubscription } from "../../../../utils/util";
dotenv.config({ path: "../../../../../env/.env" });
import { ObjectId } from "mongodb";
interface Field {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // Adjust as needed for other types
}

export async function createCheckoutSession(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "uid", type: "string" },
      { name: "sid", type: "string" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        message: validationResult.errorResponse?.message,
        success: validationResult.errorResponse?.success,
      });
    }

    let line_items: any = [];
    const { sid, uid } = req.body;
    const subscription: SubscriptionDocument | null =
      await Subscription.findOne({ _id: sid });

    if (!subscription) {
      throw error(MESSAGE.Envalide_subscription);
    }

    const promises = subscription.service.map(async (subscription: any) => {
      const price: PriceDocument | null = await Price.findById(
        { _id: subscription.priceId },
        { _id: 0, priceId: 1 }
      );

      if (!price) {
        throw error(MESSAGE.Envalide_priceId);
      }

      line_items.push({
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
        .json({ message: MESSAGE.User_not_found, success: STATUS.False });
    }

    const setting: SettingnDocument | null = await Setting.findOne({});
    if (setting && setting.stripe_secret_key != "") {
      const stripe = require("stripe")(setting.stripe_secret_key);

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        success_url: setting.paymentSuccessUrl,
        cancel_url: setting.paymentCancelUrl,
        line_items,
        metadata: {
          subscriptionId: sid,
          uid: uid,
        },
        mode: "subscription",
      });

      // get id, save to user, return url
      const sessionId = session.id;

      console.log(session);

      // save session.id to the user in your database

      const newSubscription = {
        subscriptionId: sid,
        stripeSeddioId: sessionId,
        paymentStatus: 0,
      };
      await User.findByIdAndUpdate(
        { _id: uid },
        { $push: { buySubscriptionList: newSubscription } }
      );

      res.json({ url: session.url });
    } else {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ message: MESSAGE.Add_stript_key, success: STATUS.False });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ message: MESSAGE.Internal_server_error, success: STATUS.False });
  }
}

export async function webhook(req: Request, res: Response): Promise<any> {
  try {
    const payload = req.body;
    const sessioId = payload.data.object.id;
    const status = payload.data.object.status;
    const subscriptionId = payload.data.object.metadata.subscriptionId;
    const uid = payload.data.object.metadata.uid;
    const sub = payload.data.object.subscription_details;
    console.log({ sessioId });
    console.log({ sub });
    console.log(payload);

    if (status == "complete") {
      const query = {
        _id: uid,
        "buySubscriptionList.stripeSeddioId": sessioId,
      };

      // Define the update operation
      const update = {
        $set: { "buySubscriptionList.$.paymentStatus": 1 }, // Update paymentStatus to 1 for the matched subscription
      };

      await buySubscription(uid, subscriptionId);
      await User.findOneAndUpdate(query, update);
    }
    res.status(200).end();
  } catch (err) {
    console.error("Error handling webhook event:", err);
    res.status(400).end();
  }
}
