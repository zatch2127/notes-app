const NoteModel = require('../models/Note');
const ActivityLogModel = require('../models/ActivityLog');
const { asyncHandler } = require('../middleware/errorHandler');

class NotesController {
  // Get all notes for current user
  getNotes = asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0, search } = req.query;
    
    const notes = await NoteModel.getUserNotes(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      search
    });
    
    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notes.length
        }
      }
    });
  });

  // Get single note
  getNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const note = await NoteModel.findById(id, req.user.id);
    
    res.json({
      success: true,
      data: { note }
    });
  });

  // Create new note
  createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.validatedBody;
    
    const note = await NoteModel.create({
      title,
      content,
      ownerId: req.user.id
    });
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: note.id,
      action: 'note_created',
      details: { title }
    });
    
    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  });

  // Update note
  updateNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.validatedBody;
    
    const note = await NoteModel.update(id, req.user.id, { title, content });
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: note.id,
      action: 'note_updated',
      details: { title: note.title }
    });
    
    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  });

  // Delete note
  deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const note = await NoteModel.findById(id, req.user.id);
    await NoteModel.delete(id, req.user.id);
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'note_deleted',
      details: { title: note.title }
    });
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  });

  // Search notes
  searchNotes = asyncHandler(async (req, res) => {
    const { q: search, limit = 50, offset = 0 } = req.validatedQuery;
    
    const notes = await NoteModel.getUserNotes(req.user.id, {
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        notes,
        query: search,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notes.length
        }
      }
    });
  });

  // Get note collaborators
  getCollaborators = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const collaborators = await NoteModel.getCollaborators(id, req.user.id);
    
    res.json({
      success: true,
      data: { collaborators }
    });
  });

  // Add collaborator
  addCollaborator = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, permission } = req.validatedBody;
    
    const collaborator = await NoteModel.addCollaborator(
      id,
      req.user.id,
      userId,
      permission
    );
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'collaborator_added',
      details: { collaboratorId: userId, permission }
    });
    
    res.status(201).json({
      success: true,
      message: 'Collaborator added successfully',
      data: { collaborator }
    });
  });

  // Update collaborator
  updateCollaborator = asyncHandler(async (req, res) => {
    const { id, collaboratorId } = req.params;
    const { permission } = req.validatedBody;
    
    const collaborator = await NoteModel.updateCollaborator(
      id,
      req.user.id,
      collaboratorId,
      permission
    );
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'collaborator_updated',
      details: { collaboratorId, permission }
    });
    
    res.json({
      success: true,
      message: 'Collaborator updated successfully',
      data: { collaborator }
    });
  });

  // Remove collaborator
  removeCollaborator = asyncHandler(async (req, res) => {
    const { id, collaboratorId } = req.params;
    
    await NoteModel.removeCollaborator(id, req.user.id, collaboratorId);
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'collaborator_removed',
      details: { collaboratorId }
    });
    
    res.json({
      success: true,
      message: 'Collaborator removed successfully'
    });
  });

  // Get note activities
  getNoteActivities = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Check if user has access to note
    await NoteModel.findById(id, req.user.id);
    
    const activities = await ActivityLogModel.getNoteActivities(
      id,
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  });
}

module.exports = new NotesController();
