const jwt = require("jsonwebtoken");

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "shhh");
    req.user = data;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

module.exports = { isLoggedIn };
