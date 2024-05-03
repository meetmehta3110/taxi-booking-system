import { Request, Response, NextFunction } from "express";
import { PipelineStage } from "mongoose";
import CryptoJS from "crypto-js";
import { sign } from "jsonwebtoken";

import { Entity, RoundingMethod, SortOrder } from "../constants/constant";
import { ErrorCode } from "../constants/messageCode";
import path from "path";
import {
  extractRequestData,
  extractCodeSnippetsFromStack,
} from "./errorHandler";
const { DEFAULT_LANGUAGE } = process.env as { DEFAULT_LANGUAGE: string };
import { randomBytes, randomInt } from "crypto";

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Generates a random token string of the specified length using the given characters.
 *
 * @param length The length of the token to generate.
 * @returns A randomly generated token string.
 */
export function generateServerToken(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = bytes[i] % characters.length;
    token += characters[randomIndex];
  }
  return token;
}

/**
 * Encrypts the provided token using the specified secret key.
 *
 * @param token The token to encrypt.
 * @param secretKey The secret key used for encryption.
 * @returns The encrypted token as a string.
 */
export function encryptToken(token: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
}

/**
 * Decrypts the provided encrypted token using the specified secret key.
 *
 * @param encryptedToken The encrypted token to decrypt.
 * @param secretKey The secret key used for decryption.
 * @returns The decrypted token as a string.
 */
export function decryptToken(
  encryptedToken: string,
  secretKey: string
): string {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Generates a new JWT token using the provided data and secret key.
 *
 * @param data The data to be included in the token payload.
 * @param JWT_SECRET The secret key used for signing the token.
 * @returns The encrypted JWT token as a string.
 */
export function generateNewToken(data: Object, JWT_SECRET: string): string {
  const token = sign({ ...data }, JWT_SECRET);
  return encryptToken(token, JWT_SECRET);
}

/**
 * Retrieves the Mongoose model associated with the specified entity.
 * By default, it retrieves the model for the 'CUSTOMER' entity.
 *
 * @param entity The entity for which the Mongoose model is requested.
 * @returns The Mongoose model corresponding to the specified entity.
 */

export function generateOTP(length: number = 6): string {
  // Use crypto.randomInt to generate each digit of the OTP
  return Array.from({ length }, () => randomInt(0, 10)).join("");
}

import * as fs from "fs";

export function internalServerError(
  req: Request,
  res: Response,
  error: any,
  options: Object = {}
) {
  const statusCode = error.statusCode || 500;

  const errorResponse: any = {
    message: ErrorCode.INTERNAL_SERVER_ERROR,
    errorDesctiption: error.message || "Internal Server Error",
  };

  const errorLogs = true;
  if (errorLogs) {
    errorResponse.metadata = extractRequestData(req, options);
    errorResponse.metadata.timestamp = new Date();
    errorResponse.metadata.stack = error.stack;
  }

  const codeSnippet = true;
  if (codeSnippet) {
    let depth = 3;
    const codeSnippets = extractCodeSnippetsFromStack(error.stack, depth);
    errorResponse.codeSnippets = codeSnippets;
  }

  // Generate file name based on current date
  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;
  const logFileName = `error_log_${dateString}.json`;
  const logFile = path.join(__dirname, "../../log_files", logFileName);

  const logData = JSON.stringify(errorResponse) + ",\n";

  fs.appendFile(logFile, logData, { flag: "a+" }, (error) => {
    if (error) {
      console.log("Error appending to error log file:", error);
    }
  });

  return res.status(statusCode).json(errorResponse);
}

// export function formatNumber(amount: number, decimalPlaces = 2, roundingMethod: number = RoundingMethod.ROUND): number {
//   // Convert the amount to a fixed number of decimal places and return it

//   // Apply rounding method
//   let factor = Math.pow(10, decimalPlaces);
//   console.log("factor: " + factor);
//   let result;
//   switch (roundingMethod) {
//     case RoundingMethod.FLOOR:
//       result = Math.floor(amount * factor) / factor;
//       break;
//     case RoundingMethod.CEIL:
//       result = Math.ceil(amount * factor) / factor;
//       break;
//     case RoundingMethod.ROUND:
//     default:
//       result = Math.round(amount * factor) / factor;
//   }

//   return parseFloat(result.toFixed(decimalPlaces));
// }

export function formatNumber(
  amount: number,
  decimalPlaces = 2,
  roundingMethod: RoundingMethod = RoundingMethod.ROUND,
  roundingUnit: number = 0
): number {
  // Convert the amount based on the rounding unit and apply the rounding method
  let factor = Math.pow(10, decimalPlaces);
  let unitFactor = Math.pow(10, roundingUnit); // For rounding to the nearest thousand, hundred, etc.
  let adjustedAmount = amount / unitFactor; // Adjust the amount by the rounding unit
  let result;

  switch (roundingMethod) {
    case RoundingMethod.FLOOR:
      result = Math.floor(adjustedAmount * factor) / factor;
      break;
    case RoundingMethod.CEIL:
      result = Math.ceil(adjustedAmount * factor) / factor;
      break;
    case RoundingMethod.ROUND:
    default:
      result = Math.round(adjustedAmount * factor) / factor;
  }

  // Adjust back after rounding and format to fixed decimal places
  result = parseFloat((result * unitFactor).toFixed(decimalPlaces));

  return result;
}

// console.log(formatNumber(353542.576964, 0, RoundingMethod.ROUND, 3));
// console.log(formatNumber(353542.576964, 2, RoundingMethod.ROUND, 0));
// console.log(formatNumber(13.5467, 2, RoundingMethod.ROUND, 0.1));

/**
 * Localizes nested fields in a document based on the specified language key.
 *
 * This function creates a deep copy of the original document to avoid direct mutations.
 * It traverses through the nested fields of the document identified by the provided field path.
 * If a nested field contains language-specific value for the specified language key, it prioritizes that value.
 * If no language-specific value is available, it falls back to the English value.
 * If neither language-specific nor English value is available, it sets the field value to indicate language content is not available.
 *
 * @param {object} originalDocument - The original document containing nested fields to be localized.
 * @param {string} fieldPath - The path to the nested field in dot notation (e.g., "nestedField.subField").
 * @param {string} languageKey - The language key used to localize the field value (e.g., "en" for English).
 * @returns {object} The updated document with localized nested fields.
 */
function localizeNestedFields(
  originalDocument: any,
  fieldPath: string,
  languageKey: string
): any {
  // Create a deep copy of the document to avoid direct mutations
  let document = JSON.parse(JSON.stringify(originalDocument));
  const pathParts = fieldPath.split(".");
  let current = document;
  let modified = false; // Track if any modifications are done

  // Traverse to the second last part to handle the nested structure
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (current[pathParts[i]] && typeof current[pathParts[i]] === "object") {
      current = current[pathParts[i]];
    } else {
      // Path does not exist, no modification required
      return originalDocument;
    }
  }

  // Attempt to localize the final part of the path
  const fieldName = pathParts[pathParts.length - 1];
  if (current[fieldName] && typeof current[fieldName] === "object") {
    const fieldValue = current[fieldName][languageKey]?.trim();
    const fallbackValue = current[fieldName][DEFAULT_LANGUAGE]?.trim();

    if (fieldValue) {
      current[fieldName] = fieldValue;
      modified = true;
    } else if (fallbackValue) {
      current[fieldName] = fallbackValue;
      modified = true;
    } else if (current[fieldName] !== "Language content not available") {
      current[fieldName] = "Language content not available";
      modified = true;
    }
  }

  // Only return the modified document if changes were made, otherwise return the original
  return modified ? document : originalDocument;
}

/**
 * Localizes the specified field in each document within an array to a language-specific string,
 * utilizing the `localizeDocumentField` function for each document.
 *
 * @param {Array} documentsArray - An array of document objects containing the field to localize.
 * @param {Array} fieldName - An array of the name of the field within the documents to localize.
 * @param {string} languageKey - The key corresponding to the desired language.
 * @returns {Array} - An array of localized documents with the specified field adjusted based on the language key.
 */
export function localizeFieldsInDocumentArray(
  documentsArray: any[],
  fieldPaths: string[],
  languageKey: string
): object[] {
  return documentsArray.map((document) =>
    fieldPaths.reduce((acc, fieldPath) => {
      return localizeNestedFields(acc, fieldPath, languageKey);
    }, document)
  );
}
/*
 Adds search filter to MongoDB match stage based on the provided searchText
 aggregate : filter.$match = addSearchFilter(filter.$match, searchText);
 find : filter = addSearchFilter(filter, searchText);
*/
export const addSearchTextFilter = (match: any, searchText: string) => {
  // If searchText is not provided, return the match object without any changes
  if (!searchText) return match;

  // Check if the searchText represents a numeric value
  const isNumericSearch = !isNaN(Number(searchText));

  // Check if the searchText contains '@', indicating an email search
  const isEmailSearch = searchText.includes("@");

  // Apply appropriate search filter based on the type of searchText
  if (isNumericSearch) {
    // If searchText is numeric, search by uniqueId or perform a text search
    match.$or = [
      { uniqueId: Number(searchText) },
      { $text: { $search: `"${searchText}"` } },
    ];
  } else if (isEmailSearch) {
    // If searchText contains '@', perform a text search (likely searching for an email)
    match.$text = { $search: `"${searchText}"` };
  } else {
    // Otherwise, perform a text search
    match.$text = { $search: searchText };
  }

  // Return the updated match object with search filter
  return match;
};

/*
 Function to add status filter to the match object
 aggregate : filter.$match = addStatusFilter(filter.$match, status);
 find : filter = addStatusFilter(filter, status);
*/
export const addStatusFilter = (
  match: any,
  status: string,
  field: string = "status"
) => {
  // If status is not provided, return the match object without any modifications
  if (!status) return match;

  // Split the status string into an array of status values
  let statusList: string[] = status.split(",");

  // Convert each status value to a number
  let statusNumber: number[] = statusList.map((el: string) => Number(el));

  // Add the status filter to the match object using the $in operator
  match[field] = { $in: statusNumber };

  // Return the modified match object with the status filter added
  return match;
};

/*
 Add a date filter based on the provided start and end dates
 aggregate : filter.$match = addDateFilter(filter.$match, startDate, endDate, "createdAt");
*/
export const addDateFilter = (
  match: any,
  startDate?: string,
  endDate?: string,
  field: string = "createdAt"
) => {
  let dateFilter;
  // If both start date and end date are available, return the filter for both
  if (startDate && endDate) {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0); // Set time to the start of the day

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999); // Set time to the end of the day
    dateFilter = { $gte: startOfDay, $lte: endOfDay };
  }
  // If only start date is available, return the filter for start date
  else if (startDate) {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0); // Set time to the start of the day
    dateFilter = { $gte: startOfDay };
  }
  // If only end date is available, return the filter for end date
  else if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999); // Set time to the end of the day
    dateFilter = { $lte: endOfDay };
  }
  // If none of the dates are available, return undefined (no filter)
  else {
    dateFilter = undefined;
  }

  if (dateFilter) match[field] = dateFilter;
  return match;
};

/*
 Function to add export aggregation stages based on export flag
 aggregate : const exportPipeline: PipelineStage.FacetPipelineStage[] = getExportPipeline(page, limit, isExport);
*/
export const getExportPipeline = (
  page: number,
  limit: number,
  isExport: boolean = false
): PipelineStage.FacetPipelineStage[] => {
  let pipeline: PipelineStage.FacetPipelineStage[] = [];
  if (!isExport) {
    // If not exporting data
    pipeline.push({ $skip: limit * (page - 1) }); // Add stage to skip documents based on page and limit
    pipeline.push({ $limit: limit }); // Add stage to limit the number of documents
  }
  return pipeline; // Return modified aggregation pipeline
};

/*
 Function to get sort pipeline stage
 aggregate : const sort: PipelineStage.Sort = getSortStage(sortField, sortOrder);
*/
export const getSortStage = (
  sortField: string = "uniqueId",
  sortOrder: SortOrder = -1
): PipelineStage.Sort => {
  return { $sort: { [sortField]: sortOrder } };
};

/*
 Function to get count pipeline stage
 aggregate : const count: PipelineStage.Group = getCountStage();
*/
export const getCountStage = (): PipelineStage.Group => {
  return { $group: { _id: null, total: { $sum: 1 } } };
};

// TODO: update this after admin settings finilization
export const [isShowEmail, isShowPhone] = [true, true];

// TODO: change this once admin settings are available for this
export const [isDocumentAcceptRejectSetting] = [true];
