/**
 * Attendance Controller
 * Handles CRUD operations and auto-calculation for Attendance
 */

const AttendanceModel = require('../models/attendanceModel');
const StudentModel = require('../models/studentModel');

class AttendanceController {
    static async getAll(req, res) {
        try {
            const records = await AttendanceModel.getAll();
            res.status(200).json({
                success: true,
                count: records.length,
                data: records
            });
        } catch (error) {
            console.error('[AttendanceController.getAll error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve attendance records.',
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const record = await AttendanceModel.getById(id);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: `Attendance record with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                data: record
            });
        } catch (error) {
            console.error('[AttendanceController.getById error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve attendance record.',
                error: error.message
            });
        }
    }

    static async create(req, res) {
        try {
            const { student_id, total_classes, attended_classes } = req.body;

            if (!student_id || total_classes === undefined || attended_classes === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'student_id, total_classes, and attended_classes are required.'
                });
            }

            const total = parseInt(total_classes, 10);
            const attended = parseInt(attended_classes, 10);

            if (attended > total) {
                return res.status(400).json({
                    success: false,
                    message: 'Attended classes cannot exceed total classes.'
                });
            }

            const student = await StudentModel.getById(student_id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: `Student with ID '${student_id}' does not exist.`
                });
            }

            const newRecord = await AttendanceModel.create({
                student_id,
                total_classes: total,
                attended_classes: attended
            });

            res.status(201).json({
                success: true,
                message: 'Attendance record created successfully.',
                data: newRecord
            });
        } catch (error) {
            console.error('[AttendanceController.create error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create attendance record.',
                error: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { total_classes, attended_classes } = req.body;

            if (total_classes === undefined || attended_classes === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'total_classes and attended_classes are required.'
                });
            }

            const total = parseInt(total_classes, 10);
            const attended = parseInt(attended_classes, 10);

            if (attended > total) {
                return res.status(400).json({
                    success: false,
                    message: 'Attended classes cannot exceed total classes.'
                });
            }

            const updated = await AttendanceModel.update(id, {
                total_classes: total,
                attended_classes: attended
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: `Attendance record with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                message: 'Attendance record updated successfully.',
                data: updated
            });
        } catch (error) {
            console.error('[AttendanceController.update error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update attendance record.',
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await AttendanceModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: `Attendance record with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                message: 'Attendance record deleted successfully.',
                data: deleted
            });
        } catch (error) {
            console.error('[AttendanceController.delete error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete attendance record.',
                error: error.message
            });
        }
    }
}

module.exports = AttendanceController;