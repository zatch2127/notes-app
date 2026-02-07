const db = require('../database/db');
const { NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

class NoteModel {
  // Create new note
  static async create({ title, content = '', ownerId }) {
    return db.transaction(async (client) => {
      // Create note
      const noteResult = await client.query(
        `INSERT INTO notes (title, content, owner_id, last_edited_by)
         VALUES ($1, $2, $3, $3)
         RETURNING *`,
        [title, content, ownerId]
      );
      
      const note = noteResult.rows[0];
      
      // Add owner as collaborator with owner permission
      await client.query(
        `INSERT INTO collaborators (note_id, user_id, permission)
         VALUES ($1, $2, 'owner')`,
        [note.id, ownerId]
      );
      
      return note;
    });
  }

  // Get note by ID with permission check
  static async findById(noteId, userId) {
    const result = await db.query(
      `SELECT n.*, 
              u.name as owner_name,
              c.permission as user_permission
       FROM notes n
       LEFT JOIN users u ON n.owner_id = u.id
       LEFT JOIN collaborators c ON n.id = c.note_id AND c.user_id = $2
       WHERE n.id = $1`,
      [noteId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Note not found');
    }
    
    const note = result.rows[0];
    
    if (!note.user_permission) {
      throw new ForbiddenError('Access denied');
    }
    
    return note;
  }

  // Get note by ID for public share (no auth required)
  static async findByIdPublic(noteId) {
    const result = await db.query(
      `SELECT n.id, n.title, n.content, n.created_at, n.updated_at,
              u.name as owner_name
       FROM notes n
       LEFT JOIN users u ON n.owner_id = u.id
       WHERE n.id = $1`,
      [noteId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Note not found');
    }
    
    return result.rows[0];
  }

  // Get all notes for user
  static async getUserNotes(userId, { limit = 50, offset = 0, search = null }) {
    let query = `
      SELECT n.*, 
             u.name as owner_name,
             c.permission as user_permission,
             (SELECT COUNT(*) FROM collaborators WHERE note_id = n.id) as collaborator_count
      FROM notes n
      LEFT JOIN users u ON n.owner_id = u.id
      INNER JOIN collaborators c ON n.id = c.note_id AND c.user_id = $1
    `;
    
    const params = [userId];
    
    if (search) {
      query += ` WHERE (
        to_tsvector('english', n.title) @@ plainto_tsquery('english', $${params.length + 1})
        OR to_tsvector('english', n.content) @@ plainto_tsquery('english', $${params.length + 1})
      )`;
      params.push(search);
    }
    
    query += ` ORDER BY n.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }

  // Update note
  static async update(noteId, userId, { title, content }) {
    // Check permission
    const permission = await this.getUserPermission(noteId, userId);
    
    if (!permission || !['owner', 'editor'].includes(permission)) {
      throw new ForbiddenError('Permission denied to edit note');
    }
    
    const updates = [];
    const params = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      params.push(title);
    }
    
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      params.push(content);
    }
    
    updates.push(`last_edited_by = $${paramCount++}`);
    params.push(userId);
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    params.push(noteId);
    
    const result = await db.query(
      `UPDATE notes 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    
    return result.rows[0];
  }

  // Delete note
  static async delete(noteId, userId) {
    const permission = await this.getUserPermission(noteId, userId);
    
    if (permission !== 'owner') {
      throw new ForbiddenError('Only owner can delete note');
    }
    
    const result = await db.query(
      'DELETE FROM notes WHERE id = $1 RETURNING id',
      [noteId]
    );
    
    return result.rows[0];
  }

  // Get user permission for note
  static async getUserPermission(noteId, userId) {
    const result = await db.query(
      'SELECT permission FROM collaborators WHERE note_id = $1 AND user_id = $2',
      [noteId, userId]
    );
    
    return result.rows[0]?.permission;
  }

  // Get note collaborators
  static async getCollaborators(noteId, userId) {
    const permission = await this.getUserPermission(noteId, userId);
    
    if (!permission) {
      throw new ForbiddenError('Access denied');
    }
    
    const result = await db.query(
      `SELECT c.id, c.permission, c.created_at,
              u.id as user_id, u.email, u.name
       FROM collaborators c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.note_id = $1
       ORDER BY c.created_at ASC`,
      [noteId]
    );
    
    return result.rows;
  }

  // Add collaborator
  static async addCollaborator(noteId, userId, collaboratorUserId, permission) {
    const userPermission = await this.getUserPermission(noteId, userId);
    
    if (!userPermission || !['owner', 'editor'].includes(userPermission)) {
      throw new ForbiddenError('Permission denied to add collaborators');
    }
    
    const result = await db.query(
      `INSERT INTO collaborators (note_id, user_id, permission)
       VALUES ($1, $2, $3)
       ON CONFLICT (note_id, user_id) 
       DO UPDATE SET permission = $3
       RETURNING *`,
      [noteId, collaboratorUserId, permission]
    );
    
    return result.rows[0];
  }

  // Update collaborator permission
  static async updateCollaborator(noteId, userId, collaboratorUserId, permission) {
    const userPermission = await this.getUserPermission(noteId, userId);
    
    if (userPermission !== 'owner') {
      throw new ForbiddenError('Only owner can update permissions');
    }
    
    const result = await db.query(
      `UPDATE collaborators 
       SET permission = $1
       WHERE note_id = $2 AND user_id = $3 AND permission != 'owner'
       RETURNING *`,
      [permission, noteId, collaboratorUserId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Collaborator not found or cannot modify owner');
    }
    
    return result.rows[0];
  }

  // Remove collaborator
  static async removeCollaborator(noteId, userId, collaboratorUserId) {
    const userPermission = await this.getUserPermission(noteId, userId);
    
    if (userPermission !== 'owner') {
      throw new ForbiddenError('Only owner can remove collaborators');
    }
    
    const result = await db.query(
      `DELETE FROM collaborators 
       WHERE note_id = $1 AND user_id = $2 AND permission != 'owner'
       RETURNING *`,
      [noteId, collaboratorUserId]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Collaborator not found or cannot remove owner');
    }
    
    return result.rows[0];
  }
}

module.exports = NoteModel;
