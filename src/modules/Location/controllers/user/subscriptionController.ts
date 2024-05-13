const { ObjectId } = require("mongodb");
import { validateFields, Field } from "../../../../utils/util";
import {
  STATUS_CODE,
  code,
  STATUS,
  intervals,
  subscriptionTypes,
  stripe_status,
} from "../../../../constants/constant";
import e, { Request, Response } from "express";
import { UserSubscription } from "../../models/userSubscription.model";
import { User, UserDocument } from "../../models/user.model";
import { Subscription } from "../../models/subscription.model";

import dotenv from "dotenv";
import { isObjectIdOrHexString, ObjectId } from "mongoose";
import { postRequest } from "../../../../utils/validationUtils";
import { Setting, SettingnDocument } from "../../models/setting.model";
dotenv.config({ path: "../../../../../env/.env" });

export async function list(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.query.uid;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.User_not_found, status: STATUS.False });
    }

    const subscriptionIds = user.buySubscriptionList;
    const subscriptionId: ObjectId[] = subscriptionIds.map(
      (item) => item.subscriptionId
    );
    console.log(subscriptionId);

    const data = await Subscription.aggregate([
      {
        $match: {
          _id: { $in: subscriptionId },
        },
      },
      {
        $unwind: "$service",
      },
      {
        $lookup: {
          from: "products",
          localField: "service.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "prices",
          localField: "service.priceId",
          foreignField: "_id",
          as: "price",
        },
      },
      {
        $unwind: "$price",
      },
      {
        $addFields: {
          subscriptionPeriod: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$subscriptionType", subscriptionTypes.Daily] },
                  then: intervals.Daily,
                },
                {
                  case: {
                    $eq: ["$subscriptionType", subscriptionTypes.Weekly],
                  },
                  then: intervals.Weekly,
                },
                {
                  case: { $eq: ["$subscriptionType", subscriptionTypes.Month] },
                  then: intervals.Month,
                },
                {
                  case: {
                    $eq: ["$subscriptionType", subscriptionTypes.Every_3_month],
                  },
                  then: intervals.Every_3_month,
                },
                {
                  case: {
                    $eq: ["$subscriptionType", subscriptionTypes.Every_6_month],
                  },
                  then: intervals.Every_6_month,
                },
                {
                  case: {
                    $eq: ["$subscriptionType", subscriptionTypes.Every_year],
                  },
                  then: intervals.Every_year,
                },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          subscriptionType: { $first: "$subscriptionType" },
          subscriptionPeriod: { $first: "$subscriptionPeriod" },
          description: { $first: "$descriptionns" },
          currency: { $first: "$currency" },
          symbol: { $first: "$symbol" },
          products: {
            $push: {
              productId: "$service.productId",
              productName: "$product.name",
              productImageUrl: "$product.imageUrl",
              requestLimit: "$service.requestLimit",
              unitAmount: "$price.unit_amount",
              currency: "$price.currency",
              interval: "$price.interval",
              totalPrice: {
                $multiply: ["$service.requestLimit", "$price.unit_amount"],
              },
            },
          },
          total: {
            $sum: {
              $multiply: ["$service.requestLimit", "$price.unit_amount"],
            },
          },
        },
      },
    ]);
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
    const userId: any = req.query.uid;
    const data = await UserSubscription.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          userId: 1,
          productName: "$productDetails.name",
          imageUrl: "$productDetails.imageUrl",
          maxLimit: 1,
          usedLimit: 1,
          startDate: 1,
          endDate: 1,
        },
      },
    ]);
    console.log({ userId });

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

export async function cancel(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [{ name: "sid", type: "string" }],
      validationResult;

    validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res
        .status(validationResult.errorResponse?.status_code ?? 200)
        .json({
          code: validationResult.errorResponse?.code,
          status: validationResult.errorResponse?.status,
        });
    }

    const { uid, sid } = req.body;

    const user: UserDocument | null = await User.findOne(
      { _id: uid, "buySubscriptionList.subscriptionId": sid },
      { buySubscriptionList: { $elemMatch: { subscriptionId: sid } } }
    );
    if (user) {
      console.log(user);
      const obbjeccancel = user.buySubscriptionList[0]._id;
      const stripesubscriptionId =
        user.buySubscriptionList[0].stripesubscriptionId;

      const setting: SettingnDocument | null = await Setting.findOne({});
      if (setting && setting.stripe_secret_key != "") {
        const stripe = require("stripe")(setting.stripe_secret_key);

        const subscription = await stripe.subscriptions.cancel(
          stripesubscriptionId
        );

        console.log(subscription);
        if (subscription.status == stripe_status.cancel) {
          await User.updateOne(
            { _id: uid }, // Match the document by its _id
            { $pull: { buySubscriptionList: { _id: obbjeccancel } } }
          );

          res.status(STATUS_CODE.SUCCESS).json({
            code: code.Subscription_Cancel_Successfully,
            status: STATUS.True,
          });
        } else {
          res.status(STATUS_CODE.SUCCESS).json({
            code: code.Error_on_subscription_Cancel_from_stripe,
            status: STATUS.False,
          });
        }
      } else {
        return res
          .status(STATUS_CODE.SUCCESS)
          .json({ code: code.Add_stript_key, status: STATUS.False });
      }
    } else {
      res.status(STATUS_CODE.SUCCESS).json({
        code: code.User_not_found,
        status: STATUS.False,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
