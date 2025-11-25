const jwt = require("jsonwebtoken");

// 🛡️ Authorization middleware with role checking
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token not provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded JWT info
      req.user = decoded;

      // Check role access
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports =  authorize ;
