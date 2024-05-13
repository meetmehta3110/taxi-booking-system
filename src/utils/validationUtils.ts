import { STATUS_CODE, code, STATUS } from "../../src/constants/constant";
import { Request, Response } from "express";

interface Field {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // Adjust as needed for other types
}

interface ValidationResult {
  valid: boolean;
  errorResponse?: {
    status_code: number;
    code: number;
    status: number;
  };
}

export const postRequest = (
  req: Request,
  res: Response,
  fields: Field[]
): ValidationResult => {
  for (const field of fields) {
    const { name, type } = field;
    if (typeof req.body[name] !== type) {
      return {
        valid: false,
        errorResponse: {
          status_code: STATUS_CODE.SUCCESS,
          code: code.Invalid_or_missing_parameter,
          status: STATUS.False,
        },
      };
    }
  }

  return {
    valid: true,
    errorResponse: {
      status_code: STATUS_CODE.SUCCESS,
      code: code.Right_parameter,
      status: STATUS.True,
    },
  };
};

export const getRequest = (
  req: Request,
  res: Response,
  fields: Field[]
): ValidationResult => {
  for (const field of fields) {
    const { name } = field;
    if (!req.query[name]) {
      // Assuming you're validating query parameters
      return {
        valid: false,
        errorResponse: {
          status_code: STATUS_CODE.SUCCESS,
          code: code.Invalid_or_missing_parameter,
          status: STATUS.False,
        },
      };
    }
  }

  return { valid: true };
};
