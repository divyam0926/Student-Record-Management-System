/**
 * Student Model
 * Handles database operations for students
 */

const { getPool, getIsUsingMySQL, inMemoryStore } = require('../config/db');

class StudentModel {
    static async getAll(filters = {}) {
        const { search = '', course = '', semester = '', sortBy = 'student_id', sortOrder = 'ASC' } = filters;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            let sql = `
        SELECT s.*, 
               COALESCE(att.attendance_percentage, 0) as attendance_percentage,
               COALESCE(mrk.average_marks, 0) as average_marks,
               COALESCE(mrk.subjects_count, 0) as subjects_count
        FROM students s
        LEFT JOIN (
          SELECT student_id, MAX(attendance_percentage) as attendance_percentage 
          FROM attendance 
          GROUP BY student_id
        ) att ON s.student_id = att.student_id
        LEFT JOIN (
          SELECT student_id, ROUND(AVG(total_marks), 2) as average_marks, COUNT(mark_id) as subjects_count 
          FROM marks 
          GROUP BY student_id
        ) mrk ON s.student_id = mrk.student_id
        WHERE 1=1
      `;
            const params = [];

            if (search) {
                sql += ` AND (s.student_id LIKE ? OR s.name LIKE ? OR s.email LIKE ? OR s.course LIKE ?)`;
                const q = `%${search}%`;
                params.push(q, q, q, q);
            }

            if (course) {
                sql += ` AND s.course = ?`;
                params.push(course);
            }

            if (semester) {
                sql += ` AND s.semester = ?`;
                params.push(parseInt(semester, 10));
            }

            const validSortCols = ['student_id', 'name', 'course', 'semester', 'dob', 'created_at', 'attendance_percentage', 'average_marks'];
            const col = validSortCols.includes(sortBy) ? sortBy : 'student_id';
            const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${col} ${order}`;

            const [rows] = await pool.query(sql, params);
            return rows;
        } else {
            let list = inMemoryStore.students.map(s => {
                const att = inMemoryStore.attendance.find(a => a.student_id === s.student_id);
                const stuMarks = inMemoryStore.marks.filter(m => m.student_id === s.student_id);
                const avgMarks = stuMarks.length > 0 ?
                    +(stuMarks.reduce((acc, curr) => acc + Number(curr.total_marks), 0) / stuMarks.length).toFixed(2) :
                    0;

                return {
                    ...s,
                    attendance_percentage: att ? att.attendance_percentage : 0,
                    average_marks: avgMarks,
                    subjects_count: stuMarks.length
                };
            });

            if (search) {
                const q = search.toLowerCase();
                list = list.filter(s =>
                    s.student_id.toLowerCase().includes(q) ||
                    s.name.toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q) ||
                    s.course.toLowerCase().includes(q)
                );
            }

            if (course) {
                list = list.filter(s => s.course.toLowerCase() === course.toLowerCase());
            }

            if (semester) {
                list = list.filter(s => s.semester === parseInt(semester, 10));
            }

            const orderFactor = sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
            list.sort((a, b) => {
                const valA = a[sortBy] !== undefined ? a[sortBy] : '';
                const valB = b[sortBy] !== undefined ? b[sortBy] : '';
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * orderFactor;
                }
                return String(valA).localeCompare(String(valB)) * orderFactor;
            });

            return list;
        }
    }

    static async getById(studentId) {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
            if (!students[0]) return null;

            const student = students[0];
            const [attendance] = await pool.query('SELECT * FROM attendance WHERE student_id = ?', [studentId]);
            const [marks] = await pool.query('SELECT * FROM marks WHERE student_id = ?', [studentId]);

            student.attendance = attendance[0] || null;
            student.marks = marks || [];
            return student;
        } else {
            const student = inMemoryStore.students.find(s => s.student_id.toLowerCase() === studentId.toLowerCase());
            if (!student) return null;

            const attendance = inMemoryStore.attendance.find(a => a.student_id === student.student_id) || null;
            const marks = inMemoryStore.marks.filter(m => m.student_id === student.student_id);

            return {
                ...student,
                attendance,
                marks
            };
        }
    }

    static async create(studentData) {
        const { student_id, name, gender, dob, email, phone, address, course, semester } = studentData;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            await pool.query(
                `INSERT INTO students (student_id, name, gender, dob, email, phone, address, course, semester)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [student_id, name, gender, dob, email, phone, address, course, semester]
            );
            // Auto-create initial blank attendance record
            await pool.query(
                `INSERT INTO attendance (student_id, total_classes, attended_classes) VALUES (?, 0, 0)`, [student_id]
            );
            return this.getById(student_id);
        } else {
            const existing = inMemoryStore.students.find(s => s.student_id.toLowerCase() === student_id.toLowerCase() || s.email.toLowerCase() === email.toLowerCase());
            if (existing) {
                throw new Error('Student with this ID or Email already exists');
            }

            const newStudent = {
                student_id,
                name,
                gender,
                dob,
                email,
                phone,
                address,
                course,
                semester: parseInt(semester, 10),
                created_at: new Date()
            };

            inMemoryStore.students.push(newStudent);
            inMemoryStore.attendance.push({
                attendance_id: require('../config/db').autoIncrementCounters.attendance++,
                student_id,
                total_classes: 0,
                attended_classes: 0,
                attendance_percentage: 0
            });

            return this.getById(student_id);
        }
    }

    static async update(studentId, studentData) {
        const { name, gender, dob, email, phone, address, course, semester } = studentData;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            await pool.query(
                `UPDATE students 
         SET name = ?, gender = ?, dob = ?, email = ?, phone = ?, address = ?, course = ?, semester = ?
         WHERE student_id = ?`, [name, gender, dob, email, phone, address, course, semester, studentId]
            );
            return this.getById(studentId);
        } else {
            const index = inMemoryStore.students.findIndex(s => s.student_id.toLowerCase() === studentId.toLowerCase());
            if (index === -1) return null;

            inMemoryStore.students[index] = {
                ...inMemoryStore.students[index],
                name: name !== undefined ? name : inMemoryStore.students[index].name,
                gender: gender !== undefined ? gender : inMemoryStore.students[index].gender,
                dob: dob !== undefined ? dob : inMemoryStore.students[index].dob,
                email: email !== undefined ? email : inMemoryStore.students[index].email,
                phone: phone !== undefined ? phone : inMemoryStore.students[index].phone,
                address: address !== undefined ? address : inMemoryStore.students[index].address,
                course: course !== undefined ? course : inMemoryStore.students[index].course,
                semester: semester !== undefined ? parseInt(semester, 10) : inMemoryStore.students[index].semester
            };

            return this.getById(studentId);
        }
    }

    static async delete(studentId) {
        const existing = await this.getById(studentId);
        if (!existing) return null;

        if (getIsUsingMySQL()) {
            const pool = getPool();
            // Attendance and marks are configured with ON DELETE CASCADE
            await pool.query('DELETE FROM students WHERE student_id = ?', [studentId]);
        } else {
            inMemoryStore.students = inMemoryStore.students.filter(s => s.student_id.toLowerCase() !== studentId.toLowerCase());
            inMemoryStore.attendance = inMemoryStore.attendance.filter(a => a.student_id.toLowerCase() !== studentId.toLowerCase());
            inMemoryStore.marks = inMemoryStore.marks.filter(m => m.student_id.toLowerCase() !== studentId.toLowerCase());
        }

        return existing;
    }
}

module.exports = StudentModel;