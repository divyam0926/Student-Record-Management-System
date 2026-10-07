/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

router.get('/students', ReportController.getStudentReport);
router.get('/attendance', ReportController.getAttendanceReport);
router.get('/marks', ReportController.getMarksReport);
router.get('/scholarship', ReportController.getScholarshipReport);
router.get('/top-performers', ReportController.getTopPerformingStudents);

module.exports = router;