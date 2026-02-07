const db = require('../database/db');

class ActivityLogModel {
  // Log an activity
  static async log({ userId, noteId, action, details = {} }) {
    const result = await db.query(
      `INSERT INTO activity_logs (user_id, note_id, action, details)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, noteId, action, JSON.stringify(details)]
    );
    
    return result.rows[0];
  }

  // Get activities for a note
  static async getNoteActivities(noteId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.note_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [noteId, limit, offset]
    );
    
    return result.rows;
  }

  // Get activities for a user
  static async getUserActivities(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT a.*, n.title as note_title
       FROM activity_logs a
       LEFT JOIN notes n ON a.note_id = n.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return result.rows;
  }

  // Get all recent activities (admin only)
  static async getRecentActivities(limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT a.*, 
              u.name as user_name, 
              u.email as user_email,
              n.title as note_title
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN notes n ON a.note_id = n.id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }
}

module.exports = ActivityLogModel;
