const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { 
  signupValidation, 
  loginValidation, 
  updateProfileValidation, 
  changePasswordValidation 
} = require('../middlewares/validation.middleware');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const createAuthRoutes = (db) => {
  const router = express.Router();
  const authController = new AuthController(db);
  const authenticate = authMiddleware(db);

  // Public routes
  /*router.post('/signup', authLimiter, ...signupValidation, authController.signup);
  router.post('/login', authLimiter, ...loginValidation, authController.login);
  router.post('/logout', authController.logout);
*/
  router.post('/signup', ...signupValidation, authController.signup);
  router.post('/login', ...loginValidation, authController.login);
  router.post('/logout', authController.logout);

  // Protected routes
  router.get('/profile', authenticate, authController.getProfile);
  router.put('/profile', authenticate, ...updateProfileValidation, authController.updateProfile);
  router.put('/change-password', authenticate, ...changePasswordValidation, authController.changePassword);

  return router;
};
module.exports = createAuthRoutes;