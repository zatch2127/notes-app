const ShareLinkModel = require('../models/ShareLink');
const NoteModel = require('../models/Note');
const ActivityLogModel = require('../models/ActivityLog');
const { asyncHandler } = require('../middleware/errorHandler');

class ShareLinksController {
  // Create share link for note
  createShareLink = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { expiresInDays } = req.body;
    
    // Verify user has access to note
    await NoteModel.findById(id, req.user.id);
    
    const shareLink = await ShareLinkModel.create(
      id,
      req.user.id,
      expiresInDays
    );
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'share_link_created',
      details: { linkId: shareLink.id, expiresInDays }
    });
    
    res.status(201).json({
      success: true,
      message: 'Share link created successfully',
      data: { shareLink }
    });
  });

  // Get share links for note
  getNoteShareLinks = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Verify user has access to note
    await NoteModel.findById(id, req.user.id);
    
    const shareLinks = await ShareLinkModel.getNoteLinks(id, req.user.id);
    
    res.json({
      success: true,
      data: { shareLinks }
    });
  });

  // Get note by share token (public access)
  getSharedNote = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    const shareData = await ShareLinkModel.findByToken(token);
    
    res.json({
      success: true,
      data: {
        note: {
          id: shareData.note_id,
          title: shareData.title,
          content: shareData.content,
          owner_name: shareData.owner_name,
          created_at: shareData.created_at,
          updated_at: shareData.updated_at
        },
        isPublic: true
      }
    });
  });

  // Deactivate share link
  deactivateShareLink = asyncHandler(async (req, res) => {
    const { id, linkId } = req.params;
    
    // Verify user has access to note
    await NoteModel.findById(id, req.user.id);
    
    await ShareLinkModel.deactivate(linkId, req.user.id, id);
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'share_link_deactivated',
      details: { linkId }
    });
    
    res.json({
      success: true,
      message: 'Share link deactivated successfully'
    });
  });

  // Delete share link
  deleteShareLink = asyncHandler(async (req, res) => {
    const { id, linkId } = req.params;
    
    // Verify user has access to note
    await NoteModel.findById(id, req.user.id);
    
    await ShareLinkModel.delete(linkId, req.user.id, id);
    
    // Log activity
    await ActivityLogModel.log({
      userId: req.user.id,
      noteId: id,
      action: 'share_link_deleted',
      details: { linkId }
    });
    
    res.json({
      success: true,
      message: 'Share link deleted successfully'
    });
  });
}

module.exports = new ShareLinksController();
