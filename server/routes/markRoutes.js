/**
 * Marks Routes
 */

const express = require('express');
const router = express.Router();
const MarkController = require('../controllers/markController');

router.get('/', MarkController.getAll);
router.get('/student/:studentId', MarkController.getByStudent);
router.get('/:id', MarkController.getById);
router.post('/', MarkController.create);
router.put('/:id', MarkController.update);
router.delete('/:id', MarkController.delete);

module.exports = router;