import { Request, Response, NextFunction } from "express";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import {
  TYPE_OF_USER,
  ROUTES,
  MESSAGE,
  STATUS_CODE,
  STATUS,
} from "../constants/constant";
// Retrieves the JWT secret from the environment variables and checks if it is defined.If the JWT secret is not defined, it returns a 500 status with an error message.
const { ENCRYPTION_KEY } = process.env as { ENCRYPTION_KEY: string };

// Common request and response middleware
export const commonMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Perform any processing on the request object here
  console.log("Request URL:", req.url);

  // Set common headers or properties on the response object
  res.setHeader("X-Powered-By", "express");

  // Export necessary headers

  // Call the next middleware function in the chain
  middleware(req, res, next);
};

const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const resultMatch = /\/([^\/]*)/.exec(req.path);

    if (resultMatch != null) {
      if (resultMatch[1] == ROUTES.User_without_login || (resultMatch[1] == ROUTES.Images_access ) || (resultMatch[1] == ROUTES.Stripe_access ))  {
        next();
      } else if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(
          token,
          process.env.JWT_SECRET as string,
          (err: any, user: any) => {
            if (
              (user.type === TYPE_OF_USER.USER &&
                resultMatch[1] === ROUTES.User_services_access) ||
              err ||
              (user.type === TYPE_OF_USER.USER &&
                resultMatch[1] === ROUTES.Admin_services_access) ||
              (user.type === TYPE_OF_USER.SERVICES &&
                resultMatch[1] === ROUTES.Admin_services_access)
            ) {
              res.status(STATUS_CODE.SUCCESS).json({
                message: MESSAGE.Un_authorization_access,
                success: STATUS.False,
              });
            } else {
              if (
                resultMatch &&
                resultMatch[1] === ROUTES.User_services_access
              ) {
                (req as any).body.uid = user.uid;
              }
              next();
            }
          }
        );
      } else {
        // If no Authorization header is present
        res.status(STATUS_CODE.SUCCESS).json({
          message: MESSAGE.Authorization_header_missing,
          success: STATUS.False,
        });
      }
    }
  } catch (err) {
    res
      .status(STATUS_CODE.ERROR)
      .json({ message: MESSAGE.Middleware_error, success: STATUS.False });
  }
};

export default middleware;

// Middleware to decrypt request data using AES decryption
export const decryptRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If the request body is encrypted, decrypt it
  if (req.body.encryptedData) {
    const bytes = CryptoJS.AES.decrypt(req.body.encryptedData, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    try {
      req.body = JSON.parse({ ...decryptedData, encryptedData: true });
    } catch (error) {
      req.body = { ...decryptedData, encryptedData: true }; // Set decrypted data as req.body
    }
  }

  // If query parameters are encrypted, decrypt them
  if (req.query.encryptedData) {
    const bytes = CryptoJS.AES.decrypt(
      req.query.encryptedData as string,
      ENCRYPTION_KEY
    );
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    try {
      req.query = JSON.parse(decryptedData);
    } catch (error) {
      req.query = decryptedData; // Set decrypted data as req.query
    }
  }

  // Move to the next middleware
  next();
};
