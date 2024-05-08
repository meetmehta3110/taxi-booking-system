import {
  STATUS_CODE,
  code,
  STATUS,
  subscriptionTypes,
  intervals,
  interval_count,
} from "../../../../../constants/constant";
import { Request, Response } from "express";
import { Product } from "../../../models/product.model";
import { Price } from "../../../models/price.model";

import {
  stripe_add_price,
  stripe_update_product,
  stripe_remoce_product,
  validateFields,
  Field,
} from "../../../../../utils/util";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const data = await Product.find({});
    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      data: data,
      success: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function add(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "productId", type: "string" },
      { name: "stripeProductId", type: "string" },
      { name: "unit_amount", type: "number" },
      { name: "currency", type: "string" },
      { name: "interval", type: "number" },
    ];

    const vali = await validateFields(req, res, requiredFields);
    if (!vali.success) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        success: vali.success,
      });
    }

    const { productId, unit_amount, currency, interval, stripeProductId } =
      req.body;
    if (
      interval < subscriptionTypes.subscription_start ||
      interval > subscriptionTypes.subscription_end
    ) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Invalid_subscriptionTypes,
        success: STATUS.False,
      });
    }
    let recurring = { interval: "", interval_count: 1 };
    if (interval == subscriptionTypes.Daily)
      recurring.interval = intervals.Daily;
    if (interval == subscriptionTypes.Weekly)
      recurring.interval = intervals.Weekly;
    if (interval == subscriptionTypes.Month)
      recurring.interval = intervals.Month;
    if (interval == subscriptionTypes.Every_3_month) {
      recurring.interval = intervals.Month;
      recurring.interval_count = interval_count.Every_3_month;
    }

    if (interval == subscriptionTypes.Every_6_month) {
      recurring.interval = intervals.Month;
      recurring.interval_count = interval_count.Every_6_month;
    }
    if (interval == subscriptionTypes.Every_year)
      recurring.interval = intervals.Every_year;

    const stripeProduct = await stripe_add_price(
      stripeProductId,
      unit_amount * 100,
      currency,
      recurring
    );

    if (!stripeProduct.status) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Add_stript_key,
        success: STATUS.False,
      });
    }

    const newPrice = new Price({
      productId,
      stripeProductId,
      priceId: stripeProduct.id,
      unit_amount,
      currency,
      interval,
    });

    await newPrice.save();

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function update(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "_id", type: "string" },
      { name: "stripeProductId", type: "string" },
      { name: "update", type: "object" },
    ];

    const vali = await validateFields(req, res, requiredFields);
    if (!vali.success) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        success: vali.success,
      });
    }

    const { update, _id, stripeProductId } = req.body;
    const update_strie_product = await stripe_update_product(
      stripeProductId,
      update
    );

    if (!update_strie_product.status) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Add_stript_key,
        success: STATUS.False,
      });
    }

    await Product.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function remove(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [{ name: "stripeProductId", type: "string" }],
      vali,
      update_strie_product;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.success) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        success: vali.success,
      });
    }

    const { stripeProductId } = req.body;
    update_strie_product = await stripe_remoce_product(stripeProductId);

    if (!update_strie_product.status) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Add_stript_key,
        success: STATUS.False,
      });
    }

    await Product.deleteOne({ stripeProductId });

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
