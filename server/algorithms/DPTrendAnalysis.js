/**
 * Dynamic Programming (DP) Module
 * Performance Trend Analysis & Progression
 * 
 * Analyzes semester-by-semester marks trajectory using Dynamic Programming.
 * 
 * 1. Longest Non-Decreasing Performance Subsequence (LIS):
 *    Identifies the longest sequence of semesters where the student either maintained
 *    or improved their academic performance.
 * 
 *    State Transition:
 *    dp[i] = 1 + max({ dp[j] | 0 <= j < i and marks[j] <= marks[i] } U {0})
 * 
 * 2. Optimal Trend Predictor & Growth Rate:
 *    Tabulates historical performance progression and builds predictive growth curve.
 * 
 * Time Complexity: O(n^2) for LIS DP table computation
 * Space Complexity: O(n) for DP state array
 */

class DPTrendAnalysis {
    /**
     * Analyze semester-wise marks progression using Dynamic Programming
     * @param {Array} semesterData - Array of { semester: Number, averageMarks: Number }
     */
    static analyzeStudentTrajectory(semesterData) {
        if (!semesterData || semesterData.length === 0) {
            return { success: false, message: 'No semester data provided.' };
        }

        const n = semesterData.length;
        // DP array where dp[i] stores the length of the longest non-decreasing streak ending at index i
        const dp = new Array(n).fill(1);
        // Parent pointers for path reconstruction
        const parent = new Array(n).fill(-1);
        const dpSteps = [];

        // Step-by-step DP table computation
        for (let i = 0; i < n; i++) {
            const currentSem = semesterData[i];
            dpSteps.push(`Evaluating Semester ${currentSem.semester} (Marks: ${currentSem.averageMarks})`);

            for (let j = 0; j < i; j++) {
                const prevSem = semesterData[j];
                if (prevSem.averageMarks <= currentSem.averageMarks) {
                    if (dp[j] + 1 > dp[i]) {
                        dp[i] = dp[j] + 1;
                        parent[i] = j;
                        dpSteps.push(
                            `  -> State Transition: From Sem ${prevSem.semester} (${prevSem.averageMarks}) to Sem ${currentSem.semester} (${currentSem.averageMarks}): dp[${i}] updated to ${dp[i]}`
                        );
                    }
                }
            }
        }

        // Find maximum streak in DP array
        let maxStreakLength = 0;
        let maxIndex = 0;
        for (let i = 0; i < n; i++) {
            if (dp[i] > maxStreakLength) {
                maxStreakLength = dp[i];
                maxIndex = i;
            }
        }

        // Reconstruct the optimal streak sequence (Backtracking pointers)
        const optimalStreak = [];
        let curr = maxIndex;
        while (curr !== -1) {
            optimalStreak.unshift(semesterData[curr]);
            curr = parent[curr];
        }

        // Performance Velocity & Trend Calculation
        const overallDelta = semesterData[n - 1].averageMarks - semesterData[0].averageMarks;
        const avgGrowthPerSem = n > 1 ? Number((overallDelta / (n - 1)).toFixed(2)) : 0;
        const consistencyScore = Number(((maxStreakLength / n) * 100).toFixed(1));

        let trendClassification = 'Neutral';
        if (avgGrowthPerSem > 2.0) trendClassification = 'Accelerating Growth';
        else if (avgGrowthPerSem > 0) trendClassification = 'Steady Improvement';
        else if (avgGrowthPerSem < -2.0) trendClassification = 'Significant Decline';
        else if (avgGrowthPerSem < 0) trendClassification = 'Mild Decline';

        return {
            algorithm: 'Dynamic Programming (Longest Non-Decreasing Performance Subsequence)',
            dpFormula: 'dp[i] = 1 + max(dp[j]) for all j < i where marks[j] <= marks[i]',
            timeComplexity: 'O(n^2)',
            spaceComplexity: 'O(n)',
            totalSemesters: n,
            maxContinuousGrowthStreak: maxStreakLength,
            consistencyScore: `${consistencyScore}%`,
            trendClassification,
            overallDeltaMarks: overallDelta > 0 ? `+${overallDelta.toFixed(2)}` : overallDelta.toFixed(2),
            avgGrowthPerSemester: avgGrowthPerSem,
            dpTable: semesterData.map((item, idx) => ({
                index: idx,
                semester: item.semester,
                marks: item.averageMarks,
                dpValue: dp[idx],
                predecessorIndex: parent[idx]
            })),
            optimalProgressionStreak: optimalStreak,
            executionSteps: dpSteps,
            chartData: {
                labels: semesterData.map(s => `Sem ${s.semester}`),
                allMarks: semesterData.map(s => s.averageMarks),
                streakMarks: semesterData.map(s => {
                    const inStreak = optimalStreak.find(item => item.semester === s.semester);
                    return inStreak ? inStreak.averageMarks : null;
                })
            }
        };
    }

    /**
     * Helper to generate multi-semester trajectory for any student
     */
    static getSampleTrajectory(studentId, currentAvg = 85, currentSemester = 4) {
        const semCount = Math.max(2, currentSemester);
        const data = [];
        let base = Math.max(55, currentAvg - (semCount - 1) * 3 + (Math.random() * 4 - 2));

        for (let sem = 1; sem <= semCount; sem++) {
            if (sem === semCount) {
                data.push({ semester: sem, averageMarks: Number(currentAvg.toFixed(2)) });
            } else {
                const val = Math.min(99, Math.max(50, base + (Math.random() * 8 - 2)));
                data.push({ semester: sem, averageMarks: Number(val.toFixed(2)) });
                base = val;
            }
        }

        return this.analyzeStudentTrajectory(data);
    }
}

module.exports = DPTrendAnalysis;