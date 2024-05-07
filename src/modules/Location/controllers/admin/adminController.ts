import { postRequest } from "../../../../utils/validationUtils";
import {
  STATUS_CODE,
  code,
  STATUS,
  TYPE_OF_USER,
  server_log,
} from "../../../../constants/constant";
import { Request, Response } from "express";
import { User } from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../../env/.env" });
interface Field {
  name: string;
  type: "string" | "number" | "boolean"; // Adjust as needed for other types
}

export async function register(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "username", type: "string" },
      { name: "email", type: "string" },
      { name: "password", type: "string" },
      { name: "phone", type: "string" },
      { name: "phoneCode", type: "string" },
    ];


    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        code: validationResult.errorResponse?.code,
        success: validationResult.errorResponse?.success,
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
    // Check if the user already exists
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Email_already_exists, success: STATUS.False });
    }

    const existingUserPhone = await User.findOne({ phone, phoneCode });
    if (existingUserPhone) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ code: code.Phone_already_exists, success: STATUS.False });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided information
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      phoneCode,
      registrationMode,
    });

    await newUser.save();

    return res.status(STATUS_CODE.SUCCESS).json({
      code: code.Registration_successfully,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False }); // Added internal server error response code
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const requiredFields: Field[] = [
      { name: "email", type: "string" },
      { name: "password", type: "string" },
    ];

    const validationResult = postRequest(req, res, requiredFields);

    if (!validationResult.valid) {
      return res.status(validationResult.errorResponse?.status ?? 200).json({
        code: validationResult.errorResponse?.code,
        success: validationResult.errorResponse?.success,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

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

    const accessToken = jwt.sign(
      { uid: user._id.toHexString(), type: TYPE_OF_USER.USER },
      process.env.JWT_SECRET
    );

    await User.findByIdAndUpdate({ _id: user._id }, { isLogin: true });

    res.status(STATUS_CODE.SUCCESS).json({
      data:{accessToken},
      code: code.Login_successful,
      success: STATUS.True,
    });
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.ERROR)
      .json({ code: code.Internal_server_error, success: STATUS.False });
  }
}
