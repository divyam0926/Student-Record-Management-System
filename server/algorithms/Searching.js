/**
 * Searching Algorithms Module
 * 1. Linear Search - Search by Student Name (O(n))
 * 2. Binary Search - Search by Student ID (O(log n))
 */

class SearchingAlgorithms {
    /**
     * Linear Search
     * Searches sequentially across student array by student name (case-insensitive substring or exact match)
     * Time Complexity: Best: O(1), Average: O(n), Worst: O(n)
     * Space Complexity: O(1)
     */
    static linearSearchByName(students, targetName) {
        const startTime = process.hrtime();
        const query = String(targetName).trim().toLowerCase();
        const steps = [];
        const matches = [];
        let comparisons = 0;

        for (let i = 0; i < students.length; i++) {
            comparisons++;
            const student = students[i];
            const studentNameLower = student.name.toLowerCase();
            const isMatch = studentNameLower.includes(query);

            steps.push({
                step: i + 1,
                index: i,
                studentId: student.student_id,
                candidateName: student.name,
                target: targetName,
                isMatch,
                explanation: `Index [${i}]: '${student.name}' ${isMatch ? 'MATCHES' : 'does NOT match'} target '${targetName}'`
            });

            if (isMatch) {
                matches.push(student);
            }
        }

        const diff = process.hrtime(startTime);
        const executionTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(4);

        return {
            algorithm: 'Linear Search',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            target: targetName,
            totalElements: students.length,
            comparisons,
            executionTimeMs: `${executionTimeMs} ms`,
            found: matches.length > 0,
            matchCount: matches.length,
            matches,
            steps
        };
    }

    /**
     * Binary Search
     * Efficient divide-and-conquer search on sorted array by Student ID
     * Time Complexity: Best: O(1), Average: O(log n), Worst: O(log n)
     * Space Complexity: O(1)
     */
    static binarySearchById(students, targetId) {
        const startTime = process.hrtime();
        const steps = [];
        let comparisons = 0;

        // Binary search requires sorted array
        // Normalize IDs for numerical/lexicographical sorting
        const sorted = [...students].sort((a, b) => {
            const keyA = a.student_id.toLowerCase();
            const keyB = b.student_id.toLowerCase();
            return keyA.localeCompare(keyB);
        });

        const targetKey = String(targetId).trim().toLowerCase();
        let low = 0;
        let high = sorted.length - 1;
        let foundStudent = null;
        let stepNumber = 1;

        while (low <= high) {
            comparisons++;
            const mid = Math.floor((low + high) / 2);
            const midStudent = sorted[mid];
            const midKey = midStudent.student_id.toLowerCase();

            const stepRecord = {
                step: stepNumber++,
                low,
                mid,
                high,
                midId: midStudent.student_id,
                midName: midStudent.name,
                targetId,
                action: ''
            };

            if (midKey === targetKey) {
                stepRecord.action = `Found target ID [${midStudent.student_id}] at index ${mid}!`;
                steps.push(stepRecord);
                foundStudent = midStudent;
                break;
            } else if (midKey < targetKey) {
                stepRecord.action = `[${midStudent.student_id}] < [${targetId}]. Narrow search to RIGHT half (low = ${mid + 1}).`;
                steps.push(stepRecord);
                low = mid + 1;
            } else {
                stepRecord.action = `[${midStudent.student_id}] > [${targetId}]. Narrow search to LEFT half (high = ${mid - 1}).`;
                steps.push(stepRecord);
                high = mid - 1;
            }
        }

        const diff = process.hrtime(startTime);
        const executionTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(4);

        return {
            algorithm: 'Binary Search',
            timeComplexity: 'O(log n)',
            spaceComplexity: 'O(1)',
            target: targetId,
            totalElements: sorted.length,
            comparisons,
            maxPossibleComparisons: Math.ceil(Math.log2(sorted.length || 1)),
            executionTimeMs: `${executionTimeMs} ms`,
            found: foundStudent !== null,
            student: foundStudent,
            sortedDataSnapshot: sorted.map(s => s.student_id),
            steps
        };
    }
}

module.exports = SearchingAlgorithms;