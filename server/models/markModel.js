/**
 * Mark Model
 * Handles database operations for student academic marks
 */

const { getPool, getIsUsingMySQL, inMemoryStore, autoIncrementCounters } = require('../config/db');

function calculateGrade(totalMarks) {
    const marks = Number(totalMarks);
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
}

class MarkModel {
    static async getAll() {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const sql = `
        SELECT m.*, s.name as student_name, s.course, s.semester
        FROM marks m
        JOIN students s ON m.student_id = s.student_id
        ORDER BY m.mark_id DESC
      `;
            const [rows] = await pool.query(sql);
            return rows;
        } else {
            return inMemoryStore.marks.map(m => {
                const student = inMemoryStore.students.find(s => s.student_id === m.student_id) || {};
                return {
                    ...m,
                    student_name: student.name || 'Unknown',
                    course: student.course || 'N/A',
                    semester: student.semester || 'N/A'
                };
            });
        }
    }

    static async getById(markId) {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [rows] = await pool.query(
                `SELECT m.*, s.name as student_name, s.course, s.semester
         FROM marks m
         JOIN students s ON m.student_id = s.student_id
         WHERE m.mark_id = ?`, [markId]
            );
            return rows[0] || null;
        } else {
            const record = inMemoryStore.marks.find(m => m.mark_id === parseInt(markId, 10));
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
                'SELECT * FROM marks WHERE student_id = ? ORDER BY subject_name ASC', [studentId]
            );
            return rows;
        } else {
            return inMemoryStore.marks.filter(m => m.student_id.toLowerCase() === studentId.toLowerCase());
        }
    }

    static async create(data) {
        const { student_id, subject_name, internal_marks, external_marks } = data;
        const internal = parseFloat(internal_marks) || 0;
        const external = parseFloat(external_marks) || 0;
        const total = parseFloat((internal + external).toFixed(2));
        const grade = calculateGrade(total);

        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [result] = await pool.query(
                `INSERT INTO marks (student_id, subject_name, internal_marks, external_marks, grade)
         VALUES (?, ?, ?, ?, ?)`, [student_id, subject_name, internal, external, grade]
            );
            return this.getById(result.insertId);
        } else {
            const newRecord = {
                mark_id: autoIncrementCounters.marks++,
                student_id,
                subject_name,
                internal_marks: internal,
                external_marks: external,
                total_marks: total,
                grade
            };
            inMemoryStore.marks.push(newRecord);
            return this.getById(newRecord.mark_id);
        }
    }

    static async update(markId, data) {
        const { subject_name, internal_marks, external_marks } = data;
        const internal = parseFloat(internal_marks) || 0;
        const external = parseFloat(external_marks) || 0;
        const total = parseFloat((internal + external).toFixed(2));
        const grade = calculateGrade(total);

        if (getIsUsingMySQL()) {
            const pool = getPool();
            await pool.query(
                `UPDATE marks 
         SET subject_name = ?, internal_marks = ?, external_marks = ?, grade = ?
         WHERE mark_id = ?`, [subject_name, internal, external, grade, markId]
            );
            return this.getById(markId);
        } else {
            const index = inMemoryStore.marks.findIndex(m => m.mark_id === parseInt(markId, 10));
            if (index === -1) return null;

            inMemoryStore.marks[index] = {
                ...inMemoryStore.marks[index],
                subject_name: subject_name || inMemoryStore.marks[index].subject_name,
                internal_marks: internal,
                external_marks: external,
                total_marks: total,
                grade
            };
            return this.getById(markId);
        }
    }

    static async delete(markId) {
        const existing = await this.getById(markId);
        if (!existing) return null;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            await pool.query('DELETE FROM marks WHERE mark_id = ?', [markId]);
        } else {
            inMemoryStore.marks = inMemoryStore.marks.filter(m => m.mark_id !== parseInt(markId, 10));
        }
        return existing;
    }

    static calculateGradeHelper(total) {
        return calculateGrade(total);
    }
}

module.exports = MarkModel;