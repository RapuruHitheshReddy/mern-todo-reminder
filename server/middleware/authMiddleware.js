// middleware/authMiddleware.js
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized - please log in" });
}

module.exports = ensureAuthenticated;
