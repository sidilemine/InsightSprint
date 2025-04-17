const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Middleware to protect routes that require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is active
      if (!user.active) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }
      
      // Add user to request object
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error(`Error in auth middleware: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...String} roles - Roles allowed to access the route
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Auth middleware error: User not found in request'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize
};
