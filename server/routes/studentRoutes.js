/**
 * Student Routes
 */

const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');

// Undo action (must be defined before :id route to avoid param collision)
router.post('/undo', StudentController.undoLastAction);

// Standard REST operations
router.get('/', StudentController.getAll);
router.get('/:id', StudentController.getById);
router.post('/', StudentController.create);
router.put('/:id', StudentController.update);
router.delete('/:id', StudentController.delete);

module.exports = router;