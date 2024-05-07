import { STATUS_CODE, code, STATUS } from "../../../../constants/constant";
import { Request, Response } from "express";
import { Product } from "../../models/product.model";
import { postRequest } from "../../../../utils/validationUtils";
import {
  stripe_add_product,
} from "../../../../utils/util";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

interface Field {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // Adjust as needed for other types
}

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const data = await Product.find({});
    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      data: data,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function add(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "name", type: "string" },
      { name: "filePath", type: "string" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        code: validationResult.errorResponse?.code,
        success: validationResult.errorResponse?.success,
      });
    }

    const { name, filePath } = req.body;

    const stripeProduct = await stripe_add_product(name, filePath);

    if (!stripeProduct.status) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Add_stript_key,
        success: STATUS.False,
      });
    }

    const product = new Product({
      name,
      productId: stripeProduct.id,
      imageUrl: filePath,
    });

    await product.save();

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function update(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "_id", type: "string" },
      { name: "productId", type: "string" },
      { name: "update", type: "object" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        code: validationResult.errorResponse?.code,
        success: validationResult.errorResponse?.success,
      });
    }

    const { update, _id, productId } = req.body;

    await Product.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function remove(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [{ name: "productId", type: "string" }];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        code: validationResult.errorResponse?.code,
        success: validationResult.errorResponse?.success,
      });
    }

    const { productId } = req.body;

    await Product.deleteOne({ productId });

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
