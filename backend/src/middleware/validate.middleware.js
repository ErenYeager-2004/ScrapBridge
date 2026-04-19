import { validationResult } from "express-validator";

/**
 * validate — runs express-validator's validationResult on the request.
 * If errors exist, returns 400 with a structured `errors` array.
 * Otherwise calls next().
 */
export const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};
