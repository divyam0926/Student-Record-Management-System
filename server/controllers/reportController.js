/**
 * Report Controller
 * Handles report generation, aggregations, and scholarship evaluations
 */

const StudentModel = require('../models/studentModel');
const AttendanceModel = require('../models/attendanceModel');
const MarkModel = require('../models/markModel');
const GreedyScholarshipSystem = require('../algorithms/GreedyScholarship');

class ReportController {
    /**
     * Comprehensive Student Report
     */
    static async getStudentReport(req, res) {
        try {
            const students = await StudentModel.getAll();
            const courseStats = {};

            students.forEach(s => {
                if (!courseStats[s.course]) {
                    courseStats[s.course] = { count: 0, totalMarks: 0, totalAttendance: 0 };
                }
                courseStats[s.course].count++;
                courseStats[s.course].totalMarks += Number(s.average_marks || 0);
                courseStats[s.course].totalAttendance += Number(s.attendance_percentage || 0);
            });

            const courseBreakdown = Object.keys(courseStats).map(course => ({
                course,
                studentCount: courseStats[course].count,
                averageMarks: +(courseStats[course].totalMarks / courseStats[course].count).toFixed(2),
                averageAttendance: +(courseStats[course].totalAttendance / courseStats[course].count).toFixed(2)
            }));

            res.status(200).json({
                success: true,
                generatedAt: new Date().toISOString(),
                summary: {
                    totalStudents: students.length,
                    totalCourses: Object.keys(courseStats).length
                },
                courseBreakdown,
                students
            });
        } catch (error) {
            console.error('[ReportController.getStudentReport error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate student report.',
                error: error.message
            });
        }
    }

    /**
     * Attendance Report
     */
    static async getAttendanceReport(req, res) {
        try {
            const students = await StudentModel.getAll();
            const totalStudents = students.length;

            let sumPercentage = 0;
            const highAttendance = []; // > 85%
            const averageAttendance = []; // 75% - 85%
            const defaulters = []; // < 75%

            students.forEach(s => {
                const att = Number(s.attendance_percentage || 0);
                sumPercentage += att;

                if (att > 85.0) {
                    highAttendance.push(s);
                } else if (att >= 75.0) {
                    averageAttendance.push(s);
                } else {
                    defaulters.push(s);
                }
            });

            const overallAverage = totalStudents > 0 ? +(sumPercentage / totalStudents).toFixed(2) : 0;

            res.status(200).json({
                success: true,
                generatedAt: new Date().toISOString(),
                overview: {
                    totalStudents,
                    overallAveragePercentage: overallAverage,
                    highAttendanceCount: highAttendance.length,
                    averageAttendanceCount: averageAttendance.length,
                    defaultersCount: defaulters.length
                },
                highAttendance,
                averageAttendance,
                defaulters
            });
        } catch (error) {
            console.error('[ReportController.getAttendanceReport error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate attendance report.',
                error: error.message
            });
        }
    }

    /**
     * Marks Report
     */
    static async getMarksReport(req, res) {
        try {
            const marks = await MarkModel.getAll();
            const students = await StudentModel.getAll();

            // Grade distribution
            const gradeCounts = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
            const subjectStats = {};

            marks.forEach(m => {
                const g = m.grade || 'F';
                if (gradeCounts[g] !== undefined) gradeCounts[g]++;

                if (!subjectStats[m.subject_name]) {
                    subjectStats[m.subject_name] = { count: 0, totalMarks: 0, highest: 0, lowest: 100 };
                }
                const total = Number(m.total_marks);
                subjectStats[m.subject_name].count++;
                subjectStats[m.subject_name].totalMarks += total;
                if (total > subjectStats[m.subject_name].highest) subjectStats[m.subject_name].highest = total;
                if (total < subjectStats[m.subject_name].lowest) subjectStats[m.subject_name].lowest = total;
            });

            const subjectBreakdown = Object.keys(subjectStats).map(subject => ({
                subject,
                studentsCount: subjectStats[subject].count,
                averageScore: +(subjectStats[subject].totalMarks / subjectStats[subject].count).toFixed(2),
                highestScore: subjectStats[subject].highest,
                lowestScore: subjectStats[subject].lowest
            }));

            res.status(200).json({
                success: true,
                generatedAt: new Date().toISOString(),
                totalEvaluations: marks.length,
                gradeDistribution: gradeCounts,
                subjectBreakdown,
                marks
            });
        } catch (error) {
            console.error('[ReportController.getMarksReport error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate marks report.',
                error: error.message
            });
        }
    }

    /**
     * Top Performing Students
     */
    static async getTopPerformingStudents(req, res) {
        try {
            const limit = parseInt(req.query.limit || '10', 10);
            const students = await StudentModel.getAll();

            // Sort students by average marks descending
            students.sort((a, b) => Number(b.average_marks || 0) - Number(a.average_marks || 0));

            const topRanked = students.slice(0, limit).map((s, idx) => ({
                rank: idx + 1,
                student_id: s.student_id,
                name: s.name,
                course: s.course,
                semester: s.semester,
                average_marks: s.average_marks,
                attendance_percentage: s.attendance_percentage
            }));

            res.status(200).json({
                success: true,
                count: topRanked.length,
                data: topRanked
            });
        } catch (error) {
            console.error('[ReportController.getTopPerformingStudents error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve top performers.',
                error: error.message
            });
        }
    }

    /**
     * Scholarship Eligible Students (Greedy Algorithm)
     */
    static async getScholarshipReport(req, res) {
        try {
            const students = await StudentModel.getAll();
            const quota = parseInt(req.query.quota || '5', 10);
            const grantAmount = parseInt(req.query.amount || '50000', 10);
            const totalBudget = parseInt(req.query.budget || '250000', 10);

            const scholarshipResult = GreedyScholarshipSystem.selectScholarshipRecipients(students, {
                quota,
                scholarshipAmount: grantAmount,
                totalBudget
            });

            res.status(200).json({
                success: true,
                generatedAt: new Date().toISOString(),
                ...scholarshipResult
            });
        } catch (error) {
            console.error('[ReportController.getScholarshipReport error]', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate scholarship report.',
                error: error.message
            });
        }
    }
}

module.exports = ReportController;