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
 * Rules:
 *   adminPrice  – required, numeric, > 0
 *   proposedDate – required, valid ISO 8601 date in the future
 * Note: collectorId is NOT accepted here — it is assigned later in schedulePickup.
 */
export const quoteRequestValidator = [
  body("adminPrice")
    .notEmpty()
    .withMessage("adminPrice is required.")
    .isFloat({ gt: 0 })
    .withMessage("adminPrice must be a number greater than 0."),

  body("proposedDate")
    .notEmpty()
    .withMessage("proposedDate is required.")
    .isISO8601()
    .withMessage("proposedDate must be a valid ISO 8601 date.")
    .custom((value) => {
      // Compare date strings only (YYYY-MM-DD) so today is a valid pickup date.
      // Using a full datetime comparison would reject today because the HTML date
      // input sends midnight UTC, which is already in the past for IST users.
      const proposedDateStr = value.slice(0, 10);
      const todayStr = new Date().toISOString().slice(0, 10);
      if (proposedDateStr < todayStr) {
        throw new Error("proposedDate must be today or a future date.");
      }
      return true;
    }),
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
 * schedulePickupValidator
 * Rules:
 *   collectorId   – required, non-empty string
 *   scheduledDate – optional; if provided must be a valid ISO 8601 date
 */
export const schedulePickupValidator = [
  body("collectorId")
    .notEmpty()
    .withMessage("collectorId is required."),

  body("scheduledDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("scheduledDate must be a valid ISO 8601 date."),
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
