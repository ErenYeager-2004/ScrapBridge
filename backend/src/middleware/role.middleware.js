/**
 * requireRole(...roles) — factory that returns a middleware.
 * Checks that req.user.role is included in the allowed roles list.
 *
 * Usage: router.get("/admin-only", verifyToken, requireRole("ADMIN"), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Required role(s): ${roles.join(", ")}.`,
      });
    }
    next();
  };
};
