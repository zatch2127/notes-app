const express = require('express');
const router = express.Router();
const shareLinksController = require('../controllers/shareLinksController');
const { authenticate } = require('../middleware/auth');

// Public route - access shared note
router.get('/public/:token', shareLinksController.getSharedNote);

// Protected routes
router.use(authenticate);

router.post('/:id/share', shareLinksController.createShareLink);
router.get('/:id/share', shareLinksController.getNoteShareLinks);
router.patch('/:id/share/:linkId/deactivate', shareLinksController.deactivateShareLink);
router.delete('/:id/share/:linkId', shareLinksController.deleteShareLink);

module.exports = router;
