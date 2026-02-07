const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');

class UserModel {
  // Create new user
  static async create({ email, password, name, role = 'editor' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    try {
      const result = await db.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, created_at`,
        [email, passwordHash, name, role]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictError('Email already registered');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (admin only)
  static async getAll(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT id, email, name, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Update user role (admin only)
  static async updateRole(userId, role) {
    const result = await db.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name, role`,
      [role, userId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }
    
    return result.rows[0];
  }

  // Delete user
  static async delete(userId) {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }
    
    return result.rows[0];
  }
}

module.exports = UserModel;
