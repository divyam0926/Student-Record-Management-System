/**
 * Attendance Routes
 */

const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');

router.get('/', AttendanceController.getAll);
router.get('/:id', AttendanceController.getById);
router.post('/', AttendanceController.create);
router.put('/:id', AttendanceController.update);
router.delete('/:id', AttendanceController.delete);

module.exports = router;