const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies.token; // Nueva: Lee de cookie en lugar de header
    if (!token) return res.redirect('/login');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).send('Acceso denegado');
      }
      next();
    } catch (err) {
      res.redirect('/login');
    }
  };
};

module.exports = requireAuth;