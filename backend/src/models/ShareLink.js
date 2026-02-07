const crypto = require('crypto');
const db = require('../database/db');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

class ShareLinkModel {
  // Generate secure random token
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create share link
  static async create(noteId, userId, expiresInDays = null) {
    const token = this.generateToken();
    let expiresAt = null;
    
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }
    
    const result = await db.query(
      `INSERT INTO share_links (note_id, token, created_by, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [noteId, token, userId, expiresAt]
    );
    
    return result.rows[0];
  }

  // Get share link by token
  static async findByToken(token) {
    const result = await db.query(
      `SELECT sl.*, n.id as note_id, n.title, n.content, n.created_at, n.updated_at,
              u.name as owner_name
       FROM share_links sl
       INNER JOIN notes n ON sl.note_id = n.id
       LEFT JOIN users u ON n.owner_id = u.id
       WHERE sl.token = $1 
         AND sl.is_active = true
         AND (sl.expires_at IS NULL OR sl.expires_at > CURRENT_TIMESTAMP)`,
      [token]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Share link not found or expired');
    }
    
    return result.rows[0];
  }

  // Get all share links for a note
  static async getNoteLinks(noteId, userId) {
    const result = await db.query(
      `SELECT sl.*, u.name as created_by_name
       FROM share_links sl
       LEFT JOIN users u ON sl.created_by = u.id
       WHERE sl.note_id = $1
       ORDER BY sl.created_at DESC`,
      [noteId]
    );
    
    return result.rows;
  }

  // Deactivate share link
  static async deactivate(linkId, userId, noteId) {
    const result = await db.query(
      `UPDATE share_links 
       SET is_active = false
       WHERE id = $1 AND note_id = $2
       RETURNING *`,
      [linkId, noteId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Share link not found');
    }
    
    return result.rows[0];
  }

  // Delete share link
  static async delete(linkId, userId, noteId) {
    const result = await db.query(
      `DELETE FROM share_links 
       WHERE id = $1 AND note_id = $2
       RETURNING *`,
      [linkId, noteId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Share link not found');
    }
    
    return result.rows[0];
  }
}

module.exports = ShareLinkModel;
