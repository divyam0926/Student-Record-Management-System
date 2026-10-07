/**
 * Student Controller
 * Handles CRUD operations for students and Stack-based undo rollback
 */

const StudentModel = require('../models/studentModel');
const { undoStackInstance } = require('../algorithms/Stack');

class StudentController {
    static async getAll(req, res) {
        try {
            const filters = {
                search: req.query.search || '',
                course: req.query.course || '',
                semester: req.query.semester || '',
                sortBy: req.query.sortBy || 'student_id',
                sortOrder: req.query.sortOrder || 'ASC'
            };

            const students = await StudentModel.getAll(filters);
            res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });
        } catch (error) {
            console.error('[StudentController.getAll error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve students.',
                error: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const student = await StudentModel.getById(id);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: `Student with ID '${id}' not found.`
                });
            }

            res.status(200).json({
                success: true,
                data: student
            });
        } catch (error) {
            console.error('[StudentController.getById error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve student details.',
                error: error.message
            });
        }
    }

    static async create(req, res) {
        try {
            const { student_id, name, gender, dob, email, phone, address, course, semester } = req.body;

            if (!student_id || !name || !email || !course || !semester) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID, Name, Email, Course, and Semester are required fields.'
                });
            }

            let cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanEmail) {
                const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
                cleanEmail = `${slug}@kristujayanti.com`;
            } else if (!cleanEmail.includes('@')) {
                cleanEmail = `${cleanEmail}@kristujayanti.com`;
            }

            const newStudent = await StudentModel.create({
                student_id: student_id.trim().toUpperCase(),
                name: name.trim(),
                gender: gender || 'Male',
                dob: dob || '2002-01-01',
                email: cleanEmail,
                phone: phone || '',
                address: address || '',
                course: course.trim(),
                semester: parseInt(semester, 10)
            });

            // Push action to Undo Stack
            undoStackInstance.push({
                type: 'INSERT',
                studentId: newStudent.student_id,
                data: newStudent,
                description: `Added student ${newStudent.name} (${newStudent.student_id})`
            });

            res.status(201).json({
                success: true,
                message: 'Student created successfully.',
                data: newStudent
            });
        } catch (error) {
            console.error('[StudentController.create error]', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create student.'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const existing = await StudentModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: `Student with ID '${id}' not found.`
                });
            }

            // Record state prior to update for Undo Stack
            undoStackInstance.push({
                type: 'UPDATE',
                studentId: id,
                previousState: {
                    name: existing.name,
                    gender: existing.gender,
                    dob: existing.dob,
                    email: existing.email,
                    phone: existing.phone,
                    address: existing.address,
                    course: existing.course,
                    semester: existing.semester
                },
                description: `Updated student details for ${existing.name} (${id})`
            });

            const updatePayload = { ...req.body };
            if (updatePayload.email) {
                let e = updatePayload.email.trim().toLowerCase();
                if (!e.includes('@')) {
                    e = `${e}@kristujayanti.com`;
                }
                updatePayload.email = e;
            }

            const updated = await StudentModel.update(id, updatePayload);

            res.status(200).json({
                success: true,
                message: 'Student record updated successfully.',
                data: updated
            });
        } catch (error) {
            console.error('[StudentController.update error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update student.',
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const existing = await StudentModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: `Student with ID '${id}' not found.`
                });
            }

            // Record state prior to delete for Undo Stack
            undoStackInstance.push({
                type: 'DELETE',
                studentId: id,
                deletedStudent: existing,
                description: `Deleted student ${existing.name} (${id})`
            });

            await StudentModel.delete(id);

            res.status(200).json({
                success: true,
                message: `Student ${existing.name} (${id}) deleted successfully.`,
                data: existing
            });
        } catch (error) {
            console.error('[StudentController.delete error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete student.',
                error: error.message
            });
        }
    }

    /**
     * Undo the last student action using the Stack
     */
    static async undoLastAction(req, res) {
        try {
            const popResult = undoStackInstance.pop();

            if (!popResult.success || !popResult.item) {
                return res.status(400).json({
                    success: false,
                    message: 'Undo Stack is empty. Nothing to undo.'
                });
            }

            const action = popResult.item;
            let rollbackDetails = '';

            if (action.type === 'INSERT') {
                // Undo an insert by deleting the student
                await StudentModel.delete(action.studentId);
                rollbackDetails = `Reverted addition of student ${action.studentId}. Student deleted.`;
            } else if (action.type === 'UPDATE') {
                // Undo an update by restoring previous state
                await StudentModel.update(action.studentId, action.previousState);
                rollbackDetails = `Restored previous information for student ${action.studentId}.`;
            } else if (action.type === 'DELETE') {
                // Undo a delete by re-inserting student
                const stu = action.deletedStudent;
                await StudentModel.create({
                    student_id: stu.student_id,
                    name: stu.name,
                    gender: stu.gender,
                    dob: stu.dob,
                    email: stu.email,
                    phone: stu.phone,
                    address: stu.address,
                    course: stu.course,
                    semester: stu.semester
                });
                rollbackDetails = `Restored deleted student ${stu.name} (${stu.student_id}).`;
            }

            res.status(200).json({
                success: true,
                message: `Undo successful! ${rollbackDetails}`,
                actionUndone: action,
                remainingUndoStackSize: undoStackInstance.size()
            });
        } catch (error) {
            console.error('[StudentController.undoLastAction error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to undo last action.',
                error: error.message
            });
        }
    }
}

module.exports = StudentController;