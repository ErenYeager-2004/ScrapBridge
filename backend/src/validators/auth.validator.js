import { body } from "express-validator";

/**
 * registerValidator
 * Rules: name (required), email (valid), password (min 8),
 *        phone (optional, numeric), role (HOME_USER or BUYER only).
 */
export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required and must not be empty."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required."),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),

  body("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage("Phone must be a valid phone number."),

  body("role")
    .isIn(["HOME_USER", "BUYER"])
    .withMessage(
      "Role must be one of: HOME_USER, BUYER. ADMIN and COLLECTOR cannot register publicly."
    ),
];

/**
 * loginValidator
 * Rules: email (valid), password (required).
 */
export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required."),

  body("password").notEmpty().withMessage("Password is required."),
];

/**
 * forgotPasswordValidator
 * Rules: email (valid).
 */
export const forgotPasswordValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required."),
];

/**
 * resetPasswordValidator
 * Rules: token (required), newPassword (min 8 chars).
 */
export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required."),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long."),
];
