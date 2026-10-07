/**
 * Attendance Model
 * Handles database operations for student attendance
 */

const { getPool, getIsUsingMySQL, inMemoryStore, autoIncrementCounters } = require('../config/db');

class AttendanceModel {
    static async getAll() {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const sql = `
        SELECT a.*, s.name as student_name, s.course, s.semester
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        ORDER BY a.attendance_id DESC
      `;
            const [rows] = await pool.query(sql);
            return rows;
        } else {
            return inMemoryStore.attendance.map(a => {
                const student = inMemoryStore.students.find(s => s.student_id === a.student_id) || {};
                return {
                    ...a,
                    student_name: student.name || 'Unknown',
                    course: student.course || 'N/A',
                    semester: student.semester || 'N/A'
                };
            });
        }
    }

    static async getById(attendanceId) {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [rows] = await pool.query(
                `SELECT a.*, s.name as student_name, s.course, s.semester
         FROM attendance a
         JOIN students s ON a.student_id = s.student_id
         WHERE a.attendance_id = ?`, [attendanceId]
            );
            return rows[0] || null;
        } else {
            const record = inMemoryStore.attendance.find(a => a.attendance_id === parseInt(attendanceId, 10));
            if (!record) return null;
            const student = inMemoryStore.students.find(s => s.student_id === record.student_id) || {};
            return {
                ...record,
                student_name: student.name || 'Unknown',
                course: student.course || 'N/A',
                semester: student.semester || 'N/A'
            };
        }
    }

    static async getByStudentId(studentId) {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [rows] = await pool.query(
                'SELECT * FROM attendance WHERE student_id = ?', [studentId]
            );
            return rows[0] || null;
        } else {
            return inMemoryStore.attendance.find(a => a.student_id.toLowerCase() === studentId.toLowerCase()) || null;
        }
    }

    static async create(data) {
        const { student_id, total_classes, attended_classes } = data;
        const total = parseInt(total_classes, 10);
        const attended = parseInt(attended_classes, 10);
        const percentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [result] = await pool.query(
                `INSERT INTO attendance (student_id, total_classes, attended_classes)
         VALUES (?, ?, ?)`, [student_id, total, attended]
            );
            return this.getById(result.insertId);
        } else {
            const newRecord = {
                attendance_id: autoIncrementCounters.attendance++,
                student_id,
                total_classes: total,
                attended_classes: attended,
                attendance_percentage: percentage
            };
            inMemoryStore.attendance.push(newRecord);
            return this.getById(newRecord.attendance_id);
        }
    }

    static async update(attendanceId, data) {
        const { total_classes, attended_classes } = data;
        const total = parseInt(total_classes, 10);
        const attended = parseInt(attended_classes, 10);
        const percentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            await pool.query(
                `UPDATE attendance 
         SET total_classes = ?, attended_classes = ?
         WHERE attendance_id = ?`, [total, attended, attendanceId]
            );
            return this.getById(attendanceId);
        } else {
            const index = inMemoryStore.attendance.findIndex(a => a.attendance_id === parseInt(attendanceId, 10));
            if (index === -1) return null;

            inMemoryStore.attendance[index] = {
                ...inMemoryStore.attendance[index],
                total_classes: total,
                attended_classes: attended,
                attendance_percentage: percentage
            };
            return this.getById(attendanceId);
        }
    }

    static async delete(attendanceId) {
        const existing = await this.getById(attendanceId);
        if (!existing) return null;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            await pool.query('DELETE FROM attendance WHERE attendance_id = ?', [attendanceId]);
        } else {
            inMemoryStore.attendance = inMemoryStore.attendance.filter(a => a.attendance_id !== parseInt(attendanceId, 10));
        }
        return existing;
    }
}

module.exports = AttendanceModel;