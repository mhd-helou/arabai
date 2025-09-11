const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token.utils');

class AuthController {
  constructor(db) {
    this.userModel = new User(db);
  }

  signup = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password } = req.body;

      const existingUser = await this.userModel.findByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
        is_email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const newUser = await this.userModel.create(userData);
      const sanitizedUser = this.sanitizeUser(newUser);

      const token = generateToken({ 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      });

      const refreshToken = generateRefreshToken({ 
        userId: newUser.id 
      });

      // Set secure HttpOnly cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: sanitizedUser
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  login = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      const user = await this.userModel.findByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      });

      const refreshToken = generateRefreshToken({ 
        userId: user.id 
      });

      // Set secure HttpOnly cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
//changed to lax from strict
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      const sanitizedUser = this.sanitizeUser(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: sanitizedUser
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  logout = async (req, res) => {
    try {
      // Clear authentication cookies
      res.clearCookie('token');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  getProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const sanitizedUser = this.sanitizeUser(user);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: sanitizedUser }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  updateProfile = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const { name } = req.body;

      const updates = {
        name: name.trim(),
        updated_at: new Date()
      };

      const updatedUser = await this.userModel.updateById(userId, updates);
      const sanitizedUser = this.sanitizeUser(updatedUser);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: sanitizedUser }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  changePassword = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await this.userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await this.userModel.updateById(userId, { 
        password: hashedNewPassword,
        updated_at: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  refreshToken = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await this.userModel.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token - user not found'
        });
      }

      // Generate new access token
      const newToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Set new access token cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully'
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  };

  sanitizeUser(user) {
    if (!user) return null;
    const { password, reset_password_token, reset_password_expire, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = AuthController;