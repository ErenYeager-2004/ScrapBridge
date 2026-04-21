import { body } from "express-validator";

/**
 * createRequestValidator
 * Rules: items (required, non-empty string), pickupAddress (required).
 * Note: items arrives as a JSON string in multipart/form-data payloads.
 */
export const createRequestValidator = [
  body("items")
    .notEmpty()
    .withMessage("items is required and must not be empty."),

  body("pickupAddress")
    .trim()
    .notEmpty()
    .withMessage("pickupAddress is required."),
];

/**
 * quoteRequestValidator
 * Rules: adminPrice (required, numeric, > 0), collectorId (required).
 */
export const quoteRequestValidator = [
  body("adminPrice")
    .notEmpty()
    .withMessage("adminPrice is required.")
    .isFloat({ gt: 0 })
    .withMessage("adminPrice must be a number greater than 0."),

  body("collectorId")
    .notEmpty()
    .withMessage("collectorId is required."),
];

/**
 * respondValidator
 * Rules: action (required, must be "accept" or "reject").
 */
export const respondValidator = [
  body("action")
    .notEmpty()
    .withMessage("action is required.")
    .isIn(["accept", "reject"])
    .withMessage('action must be either "accept" or "reject".'),
];

/**
 * scheduleValidator
 * Rules: scheduledDate (required, must be a valid ISO date in the future).
 */
export const scheduleValidator = [
  body("scheduledDate")
    .notEmpty()
    .withMessage("scheduledDate is required.")
    .isISO8601()
    .withMessage("scheduledDate must be a valid ISO 8601 date.")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("scheduledDate must be a future date.");
      }
      return true;
    }),
];

/**
 * rejectValidator
 * Rules: rejectionReason (optional string, trimmed).
 * No required field — admin may reject without providing a reason.
 */
export const rejectValidator = [
  body("rejectionReason")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("rejectionReason must be a string.")
    .trim(),
];
