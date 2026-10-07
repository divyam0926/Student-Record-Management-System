/**
 * Greedy Algorithm Implementation
 * Scholarship Selection System
 * 
 * Problem Formulation:
 * A university has limited scholarship funds/slots.
 * Eligibility Criteria:
 *   - Attendance Percentage > 85%
 *   - Average Marks > 80%
 * 
 * Greedy Strategy:
 * 1. Filter all students meeting the dual minimum eligibility thresholds.
 * 2. Calculate a Composite Merit Index for each: Merit = (0.6 * Marks) + (0.4 * Attendance).
 * 3. Greedily sort candidates in descending order of Composite Merit Score.
 * 4. Allocate scholarship awards up to the quota/budget limit.
 * 
 * Time Complexity: O(n log n) due to greedy sorting
 * Space Complexity: O(n) to store candidates and traces
 */

class GreedyScholarshipSystem {
    /**
     * Select scholarship recipients using Greedy strategy
     * @param {Array} students - list of student objects with attendance_percentage & average_marks
     * @param {Object} options - { quota: 5, scholarshipAmount: 50000, totalBudget: 250000 }
     */
    static selectScholarshipRecipients(students, options = {}) {
        const quota = options.quota || 5;
        const scholarshipAmount = options.scholarshipAmount || 50000;
        const totalBudget = options.totalBudget || 250000;

        const evaluationTrace = [];
        const eligiblePool = [];
        const disqualified = [];

        // Step 1: Constraint Verification
        for (const s of students) {
            const attendance = Number(s.attendance_percentage || 0);
            const marks = Number(s.average_marks || 0);

            const meetsAttendance = attendance > 85.0;
            const meetsMarks = marks > 80.0;
            const isEligible = meetsAttendance && meetsMarks;

            const meritScore = Number((0.6 * marks + 0.4 * attendance).toFixed(2));

            const candidate = {
                student_id: s.student_id,
                name: s.name,
                course: s.course,
                semester: s.semester,
                attendance_percentage: attendance,
                average_marks: marks,
                meritScore,
                meetsAttendance,
                meetsMarks,
                isEligible
            };

            if (isEligible) {
                eligiblePool.push(candidate);
                evaluationTrace.push({
                    student_id: s.student_id,
                    name: s.name,
                    status: 'ELIGIBLE',
                    reason: `Attendance: ${attendance}% (>85%) AND Marks: ${marks}% (>80%). Merit Score: ${meritScore}`
                });
            } else {
                const reasons = [];
                if (!meetsAttendance) reasons.push(`Attendance ${attendance}% <= 85%`);
                if (!meetsMarks) reasons.push(`Marks ${marks}% <= 80%`);
                disqualified.push({...candidate, failureReason: reasons.join(', ') });
                evaluationTrace.push({
                    student_id: s.student_id,
                    name: s.name,
                    status: 'DISQUALIFIED',
                    reason: reasons.join('; ')
                });
            }
        }

        // Step 2: Greedy Ordering by Merit Score Descending
        eligiblePool.sort((a, b) => b.meritScore - a.meritScore);

        // Step 3: Greedy Allocation under Quota and Budget
        const selectedRecipients = [];
        let currentBudgetSpent = 0;
        const allocationTrace = [];

        for (let i = 0; i < eligiblePool.length; i++) {
            const candidate = eligiblePool[i];

            if (selectedRecipients.length < quota && (currentBudgetSpent + scholarshipAmount) <= totalBudget) {
                currentBudgetSpent += scholarshipAmount;
                selectedRecipients.push({
                    rank: selectedRecipients.length + 1,
                    ...candidate,
                    awardAmount: scholarshipAmount
                });

                allocationTrace.push({
                    rank: selectedRecipients.length,
                    student_id: candidate.student_id,
                    name: candidate.name,
                    meritScore: candidate.meritScore,
                    action: 'ACCEPTED (AWARDED)',
                    cumulativeSpent: currentBudgetSpent,
                    remainingBudget: totalBudget - currentBudgetSpent
                });
            } else {
                allocationTrace.push({
                    rank: i + 1,
                    student_id: candidate.student_id,
                    name: candidate.name,
                    meritScore: candidate.meritScore,
                    action: 'WAITLISTED (Quota or budget constraint reached)',
                    cumulativeSpent: currentBudgetSpent,
                    remainingBudget: totalBudget - currentBudgetSpent
                });
            }
        }

        return {
            algorithm: 'Greedy Choice Mechanism',
            criteria: {
                minAttendance: '> 85.0%',
                minMarks: '> 80.0%',
                meritWeightFormula: '0.6 * Marks + 0.4 * Attendance'
            },
            constraints: {
                maximumQuota: quota,
                perStudentGrant: scholarshipAmount,
                totalBudgetAvailable: totalBudget
            },
            summary: {
                totalEvaluated: students.length,
                eligibleCount: eligiblePool.length,
                disqualifiedCount: disqualified.length,
                awardedCount: selectedRecipients.length,
                totalBudgetDisbursed: currentBudgetSpent
            },
            selectedRecipients,
            waitlisted: eligiblePool.slice(selectedRecipients.length),
            disqualified,
            evaluationTrace,
            allocationTrace
        };
    }
}

module.exports = GreedyScholarshipSystem;