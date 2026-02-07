const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Notes CRUD
router.get('/', notesController.getNotes);
router.get('/search', validateQuery(schemas.search.query), notesController.searchNotes);
router.get('/:id', notesController.getNote);
router.post('/', validate(schemas.note.create), notesController.createNote);
router.patch('/:id', validate(schemas.note.update), notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

// Collaborators
router.get('/:id/collaborators', notesController.getCollaborators);
router.post('/:id/collaborators', validate(schemas.collaborator.add), notesController.addCollaborator);
router.patch('/:id/collaborators/:collaboratorId', validate(schemas.collaborator.update), notesController.updateCollaborator);
router.delete('/:id/collaborators/:collaboratorId', notesController.removeCollaborator);

// Activities
router.get('/:id/activities', notesController.getNoteActivities);

module.exports = router;
