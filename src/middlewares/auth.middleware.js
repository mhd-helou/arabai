const { verifyToken, extractTokenFromHeader } = require('../utils/token.utils');
const User = require('../models/user.model');



const authMiddleware = (db) => {
  const userModel = new User(db);

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
      }

      const decoded = verifyToken(token);
      const user = await userModel.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - user not found'
        });
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  };
};

const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

const optionalAuth = (db) => {
  const userModel = new User(db);

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        req.user = null;
        return next();
      }

      const decoded = verifyToken(token);
      const user = await userModel.findById(decoded.userId);

      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        };
      } else {
        req.user = null;
      }

      next();
    } catch (error) {
      req.user = null;
      next();
    }
  };
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth
};