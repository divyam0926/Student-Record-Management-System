/**
 * Mark Controller
 * Handles CRUD operations, automated total calculation, and grade evaluation
 */

const MarkModel = require('../models/markModel');
const StudentModel = require('../models/studentModel');

class MarkController {
    static async getAll(req, res) {
        try {
            const records = await MarkModel.getAll();
            res.status(200).json({
                success: true,
                count: records.length,
                data: records
            });
        } catch (error) {
            console.error('[MarkController.getAll error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve marks.',
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const mark = await MarkModel.getById(id);

            if (!mark) {
                return res.status(404).json({
                    success: false,
                    message: `Mark record with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                data: mark
            });
        } catch (error) {
            console.error('[MarkController.getById error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve mark record.',
                error: error.message
            });
        }
    }

    static async getByStudent(req, res) {
        try {
            const { studentId } = req.params;
            const marks = await MarkModel.getByStudentId(studentId);

            res.status(200).json({
                success: true,
                count: marks.length,
                data: marks
            });
        } catch (error) {
            console.error('[MarkController.getByStudent error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve student marks.',
                error: error.message
            });
        }
    }

    static async create(req, res) {
        try {
            const { student_id, subject_name, internal_marks, external_marks } = req.body;

            if (!student_id || !subject_name || internal_marks === undefined || external_marks === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'student_id, subject_name, internal_marks, and external_marks are required.'
                });
            }

            const internal = parseFloat(internal_marks);
            const external = parseFloat(external_marks);

            if (internal < 0 || internal > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'Internal marks must be between 0 and 30.'
                });
            }

            if (external < 0 || external > 70) {
                return res.status(400).json({
                    success: false,
                    message: 'External marks must be between 0 and 70.'
                });
            }

            const student = await StudentModel.getById(student_id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: `Student with ID '${student_id}' does not exist.`
                });
            }

            const newMark = await MarkModel.create({
                student_id,
                subject_name: subject_name.trim(),
                internal_marks: internal,
                external_marks: external
            });

            res.status(201).json({
                success: true,
                message: `Mark added successfully. Grade: ${newMark.grade}`,
                data: newMark
            });
        } catch (error) {
            console.error('[MarkController.create error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to record marks.',
                error: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { subject_name, internal_marks, external_marks } = req.body;

            const internal = parseFloat(internal_marks);
            const external = parseFloat(external_marks);

            if (internal < 0 || internal > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'Internal marks must be between 0 and 30.'
                });
            }

            if (external < 0 || external > 70) {
                return res.status(400).json({
                    success: false,
                    message: 'External marks must be between 0 and 70.'
                });
            }

            const updated = await MarkModel.update(id, {
                subject_name,
                internal_marks: internal,
                external_marks: external
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: `Mark record with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                message: `Mark updated successfully. Grade: ${updated.grade}`,
                data: updated
            });
        } catch (error) {
            console.error('[MarkController.update error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update marks.',
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await MarkModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: `Mark record with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                message: 'Mark record deleted successfully.',
                data: deleted
            });
        } catch (error) {
            console.error('[MarkController.delete error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete mark record.',
                error: error.message
            });
        }
    }
}

module.exports = MarkController;