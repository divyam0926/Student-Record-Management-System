/**
 * Backtracking Algorithm Module
 * Course Selection & Prerequisite Validation System
 * 
 * Problem Formulation:
 * A student wants to register for an optimal combination of K elective courses in a semester.
 * Each course has:
 *  - Course Code & Name
 *  - Credits
 *  - Prerequisite Courses (must have already been completed or included earlier)
 * 
 * Backtracking Strategy:
 * 1. Choose a course candidate.
 * 2. Validate Constraints:
 *    - All prerequisites satisfied.
 *    - Total credits does not exceed semester limit.
 *    - No duplicate courses.
 * 3. If valid, recursively branch to select subsequent courses.
 * 4. If an invalid state or constraint violation is reached, BACKTRACK (prune branch).
 * 
 * Time Complexity: O(b^d) with pruning, where b is branching factor and d is depth
 * Space Complexity: O(d) call stack depth
 */

class BacktrackingCourseValidator {
    /**
     * Available Course Catalog with Prerequisites and Credits
     */
    static getCourseCatalog() {
        return [
            { code: 'CS101', name: 'Programming Fundamentals', credits: 4, prerequisites: [] },
            { code: 'CS102', name: 'Data Structures & Algorithms', credits: 4, prerequisites: ['CS101'] },
            { code: 'CS103', name: 'Database Management Systems', credits: 3, prerequisites: ['CS101'] },
            { code: 'CS104', name: 'Web Technologies', credits: 3, prerequisites: ['CS101'] },
            { code: 'CS201', name: 'Advanced Algorithms', credits: 4, prerequisites: ['CS102'] },
            { code: 'CS202', name: 'Machine Learning Foundations', credits: 4, prerequisites: ['CS102', 'CS103'] },
            { code: 'CS203', name: 'Cloud Computing Architecture', credits: 3, prerequisites: ['CS103'] },
            { code: 'CS204', name: 'Deep Learning & Neural Networks', credits: 4, prerequisites: ['CS202'] },
            { code: 'CS205', name: 'Computer Vision', credits: 3, prerequisites: ['CS202'] }
        ];
    }

    /**
     * Generate valid combinations of courses satisfying prerequisites and credit bounds
     * @param {Array<string>} completedCourses - Courses student has already passed
     * @param {number} requiredCoursesCount - Number of courses to register
     * @param {number} maxCredits - Maximum credits allowed per semester
     */
    static generateValidCoursePlans(completedCourses = ['CS101'], requiredCoursesCount = 3, maxCredits = 12) {
        const catalog = this.getCourseCatalog();
        const completedSet = new Set(completedCourses.map(c => c.toUpperCase()));
        const validPlans = [];
        const executionTrace = [];
        let stateEvaluations = 0;
        let prunedBranches = 0;

        // Available courses that have not already been passed
        const availablePool = catalog.filter(c => !completedSet.has(c.code));

        /**
         * Recursive Backtracking Function
         * @param {number} startIndex - Current catalog index to consider
         * @param {Array} currentPlan - Currently accumulated courses
         * @param {number} currentCredits - Accumulated credit sum
         * @param {Set} takenInPlan - Course codes in current plan
         */
        function backtrack(startIndex, currentPlan, currentCredits, takenInPlan) {
            stateEvaluations++;

            // Goal state reached: desired number of courses selected
            if (currentPlan.length === requiredCoursesCount) {
                if (currentCredits <= maxCredits) {
                    validPlans.push({
                        planId: validPlans.length + 1,
                        courses: [...currentPlan],
                        totalCredits: currentCredits,
                        courseCodes: currentPlan.map(c => c.code)
                    });
                    executionTrace.push({
                        type: 'GOAL_FOUND',
                        step: stateEvaluations,
                        message: `Found Valid Combination [${currentPlan.map(c => c.code).join(', ')}] with ${currentCredits} credits.`
                    });
                }
                return;
            }

            // Explore branching options
            for (let i = startIndex; i < availablePool.length; i++) {
                const candidate = availablePool[i];

                // Constraint 1: Credit limit check
                if (currentCredits + candidate.credits > maxCredits) {
                    prunedBranches++;
                    executionTrace.push({
                        type: 'PRUNED_CREDIT',
                        step: stateEvaluations,
                        candidate: candidate.code,
                        message: `Pruned '${candidate.code}': Exceeds credit limit (${currentCredits + candidate.credits} > ${maxCredits}).`
                    });
                    continue; // Backtrack
                }

                // Constraint 2: Prerequisites validation
                // All prerequisites must be either in completedCourses OR already taken in currentPlan
                const missingPrereqs = candidate.prerequisites.filter(
                    prereq => !completedSet.has(prereq) && !takenInPlan.has(prereq)
                );

                if (missingPrereqs.length > 0) {
                    prunedBranches++;
                    executionTrace.push({
                        type: 'PRUNED_PREREQ',
                        step: stateEvaluations,
                        candidate: candidate.code,
                        message: `Pruned '${candidate.code}': Missing prerequisite(s) [${missingPrereqs.join(', ')}].`
                    });
                    continue; // Backtrack
                }

                // Decision: Include candidate course
                currentPlan.push(candidate);
                takenInPlan.add(candidate.code);
                executionTrace.push({
                    type: 'CHOOSE',
                    step: stateEvaluations,
                    candidate: candidate.code,
                    message: `Chose '${candidate.code}' (${candidate.name}). Branching deeper...`
                });

                // Recurse
                backtrack(i + 1, currentPlan, currentCredits + candidate.credits, takenInPlan);

                // Undo Decision: Backtrack
                currentPlan.pop();
                takenInPlan.delete(candidate.code);
                executionTrace.push({
                    type: 'BACKTRACK',
                    step: stateEvaluations,
                    candidate: candidate.code,
                    message: `Backtracked: Removed '${candidate.code}'. Exploring next alternative...`
                });
            }
        }

        backtrack(0, [], 0, new Set());

        return {
            algorithm: 'Backtracking with Constraint Satisfaction & Branch Pruning',
            parameters: {
                completedCourses,
                targetCoursesCount: requiredCoursesCount,
                maxCreditLimit: maxCredits
            },
            catalog: catalog,
            statistics: {
                totalStatesExplored: stateEvaluations,
                prunedBranchesCount: prunedBranches,
                validCombinationsFound: validPlans.length
            },
            validPlans,
            executionTrace: executionTrace.slice(0, 40) // Limit trace to top 40 for UI clarity
        };
    }
}

module.exports = BacktrackingCourseValidator;