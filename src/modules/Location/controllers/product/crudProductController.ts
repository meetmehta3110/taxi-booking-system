import { STATUS_CODE, code, STATUS } from "../../../../constants/constant";
import { Request, Response } from "express";
import { Product } from "../../models/product.model";
import {
  stripe_add_product,
  validateFields,
  Field,
} from "../../../../utils/util";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });

export async function get(req: Request, res: Response): Promise<any> {
  try {
    const data = await Product.find({});
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

export async function add(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
        { name: "name", type: "string" },
        { name: "filePath", type: "string" },
      ],
      vali,
      stripeProduct,
      product;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.status) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        status: vali.success,
      });
    }

    const { name, filePath } = req.body;

    stripeProduct = await stripe_add_product(name, filePath);

    if (!stripeProduct.status) {
      return res.status(STATUS_CODE.SUCCESS).json({
        code: code.Add_stript_key,
        status: STATUS.False,
      });
    }

    product = new Product({
      name,
      productId: stripeProduct.id,
      imageUrl: filePath,
    });

    await product.save();

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function update(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
        { name: "_id", type: "string" },
        { name: "update", type: "object" },
      ],
      vali;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.status) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        status: vali.success,
      });
    }

    const { update, _id } = req.body;

    await Product.findByIdAndUpdate({ _id }, update);

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}

export async function remove(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [{ name: "productId", type: "string" }],
      vali;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.status) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        status: vali.status,
      });
    }

    const { productId } = req.body;

    await Product.deleteOne({ productId });

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Request_process_successfully,
      status: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, status: STATUS.False });
  }
}
