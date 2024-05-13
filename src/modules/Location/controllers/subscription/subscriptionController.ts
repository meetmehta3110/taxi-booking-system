import {
  STATUS_CODE,
  code,
  STATUS,
  intervals,
  subscriptionTypes,
} from "../../../../constants/constant";
import { Request, Response } from "express";
import { Subscription } from "../../models/subscription.model";
import { postRequest } from "../../../../utils/validationUtils";
import dotenv from "dotenv";
import { Price } from "../../models/price.model";
dotenv.config({ path: "../../../../../env/.env" });

interface Field {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // Adjust as needed for other types
}

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const data = await Subscription.aggregate([
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
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function add(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "service", type: "object" },
      { name: "visible", type: "boolean" },
      { name: "descriptionns", type: "string" },
      { name: "currency", type: "string" },
      { name: "symbol", type: "string" },
      { name: "subscriptionType", type: "number" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res
        .status(validationResult.errorResponse?.status_code ?? 200)
        .json({
          code: validationResult.errorResponse?.code,
          status: validationResult.errorResponse?.status,
        });
    }

    let {
      service,
      visible,
      descriptionns,
      subscriptionType,
      currency,
      symbol,
    } = req.body;
    currency = currency.toLowerCase();


    //velideate pricing and subscriptions
    let findal_status = true;
    const promises = service.map(async (subscription: any) => {
      const status = await Price.findOne({
        _id: subscription.priceId,
        interval: subscriptionType,
        currency,
      });

      if (!status) {
        findal_status = false;
      }
    });

    await Promise.all(promises);

    if (!findal_status) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Invalide_price_interval,
        status: STATUS.False,
      });
    }

    const subscription = new Subscription({
      service,
      visible,
      descriptionns,
      subscriptionType,
      currency,
      symbol,
    });

    await subscription.save();

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function update(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "_id", type: "string" },
      { name: "update", type: "object" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res
        .status(validationResult.errorResponse?.status_code ?? 200)
        .json({
          code: validationResult.errorResponse?.code,
          status: validationResult.errorResponse?.status,
        });
    }

    const { _id, update } = req.body;

    await Subscription.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function remove(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "_id", type: "string" }];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res
        .status(validationResult.errorResponse?.status_code ?? 200)
        .json({
          code: validationResult.errorResponse?.code,
          status: validationResult.errorResponse?.status,
        });
    }

    const { _id } = req.body;

    await Subscription.findByIdAndDelete({ _id });

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
