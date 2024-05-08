import { validateFields, Field } from "../../../../../src/utils/util";
import {
  STATUS_CODE,
  code,
  STATUS,
  TYPE_OF_USER,
  server_log,
} from "../../../../../src/constants/constant";
import { Request, Response } from "express";
import { User } from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Setting, SettingnDocument } from "../../models/setting.model";

dotenv.config({ path: "../../../../../env/.env" });

export async function register(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
        { name: "username", type: "string" },
        { name: "email", type: "string" },
        { name: "password", type: "string" },
        { name: "phone", type: "string" },
        { name: "phoneCode", type: "string" },
      ],
      vali,
      newUser,
      stripeCustomerId,
      customer,
      stripe,
      setting,
      hashedPassword,
      existingUserPhone,
      existingUserEmail;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.success) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        success: vali.success,
      });
    }

    const {
      username,
      email,
      password,
      phone,
      phoneCode,
      registrationMode = 0,
    } = req.body;

    existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Email_already_exists, success: STATUS.False });
    }

    existingUserPhone = await User.findOne({ phone, phoneCode });
    if (existingUserPhone) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Phone_already_exists, success: STATUS.False });
    }

    hashedPassword = await bcrypt.hash(password, 10);
    setting = await Setting.findOne({});

    if (!setting?.stripe_secret_key) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Add_stript_key, success: STATUS.False });
    }

    stripe = require("stripe")(setting.stripe_secret_key);
    customer = await stripe.customers.create({
      name: username,
      email: email,
    });
    stripeCustomerId = customer.id;

    newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      phoneCode,
      registrationMode,
      stripeCustomerId,
    });
    await newUser.save();

    return res
      .status(STATUS_CODE.SUCCESS)
      .json({ code: code.Registration_successfully, success: STATUS.True });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    let requiredFields: Field[] = [
        { name: "email", type: "string" },
        { name: "password", type: "string" },
      ],
      vali,
      user,
      accessToken;

    vali = await validateFields(req, res, requiredFields);
    if (!vali.success) {
      return res.status(vali.STATUS_CODE).json({
        code: vali.code,
        success: vali.success,
      });
    }

    const { email, password } = req.body;
    user = await User.findOne(
      { email },
      { buySubscriptionList: 0, twillo: 0, api_key: 0 }
    );

    if (!user) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.User_not_found, success: STATUS.False });
    }

    if (user.isApprove == 0) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Youre_unapproved, success: STATUS.False });
    }

    if (!user.validPassword(password)) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Invalid_password, success: STATUS.False });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        `JWT_SECRET ${server_log.Environment_variable_is_not_defined}`
      );
    }

    accessToken = jwt.sign(
      { uid: user._id.toHexString(), type: TYPE_OF_USER.USER },
      process.env.JWT_SECRET
    );

    await User.findByIdAndUpdate({ _id: user._id }, { isLogin: true });
    user.password = "";
    return res.status(STATUS_CODE.SUCCESS).json({
      data: { token: accessToken, user },
      code: 201,
      success: STATUS.True,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
