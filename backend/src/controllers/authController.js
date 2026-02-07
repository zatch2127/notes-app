const UserModel = require('../models/User');
const ActivityLogModel = require('../models/ActivityLog');
const { generateToken } = require('../middleware/auth');
const { UnauthorizedError } = require('../middleware/errorHandler');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // Register new user
  register = asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.validatedBody;
    
    const user = await UserModel.create({ email, password, name, role });
    const token = generateToken(user);
    
    // Log activity
    await ActivityLogModel.log({
      userId: user.id,
      action: 'user_registered',
      details: { email }
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  });

  // Login user
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.validatedBody;
    
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const token = generateToken(user);
    
    // Log activity
    await ActivityLogModel.log({
      userId: user.id,
      action: 'user_login',
      details: { email }
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  });

  // Get current user
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    
    res.json({
      success: true,
      data: { user }
    });
  });

  // Logout (client-side token removal, log activity)
  logout = asyncHandler(async (req, res) => {
    await ActivityLogModel.log({
      userId: req.user.id,
      action: 'user_logout'
    });
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
}

module.exports = new AuthController();
