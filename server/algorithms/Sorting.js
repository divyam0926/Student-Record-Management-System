/**
 * Sorting Algorithms Module
 * Implements optimized Bubble Sort for:
 * 1. Student Names
 * 2. Attendance Percentage
 * 3. Total Marks
 * Time Complexity: Best: O(n), Average: O(n^2), Worst: O(n^2)
 * Space Complexity: O(1) in-place
 */

class SortingAlgorithms {
    /**
     * Optimized Bubble Sort
     * @param {Array} array - array of objects
     * @param {String} field - 'name' | 'attendance_percentage' | 'total_marks' | 'average_marks'
     * @param {String} direction - 'asc' | 'desc'
     */
    static bubbleSort(array, field = 'name', direction = 'asc') {
        const startTime = process.hrtime();
        const arr = JSON.parse(JSON.stringify(array));
        const n = arr.length;
        const passes = [];
        let totalComparisons = 0;
        let totalSwaps = 0;

        const isGreater = (valA, valB) => {
            if (typeof valA === 'string') {
                return valA.localeCompare(valB) > 0;
            }
            return Number(valA) > Number(valB);
        };

        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            const passSwaps = [];

            for (let j = 0; j < n - i - 1; j++) {
                totalComparisons++;
                const itemA = arr[j];
                const itemB = arr[j + 1];

                const rawA = itemA[field] !== undefined ? itemA[field] : (itemA.average_marks || 0);
                const rawB = itemB[field] !== undefined ? itemB[field] : (itemB.average_marks || 0);

                const shouldSwap = direction.toLowerCase() === 'asc' ?
                    isGreater(rawA, rawB) :
                    isGreater(rawB, rawA);

                if (shouldSwap) {
                    // Swap arr[j] and arr[j+1]
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                    totalSwaps++;

                    passSwaps.push({
                        swappedIndices: [j, j + 1],
                        elementA: itemA.name || itemA.student_id,
                        elementB: itemB.name || itemB.student_id,
                        valA: rawA,
                        valB: rawB
                    });
                }
            }

            passes.push({
                pass: i + 1,
                swapsCount: passSwaps.length,
                swapDetails: passSwaps,
                arraySnapshot: arr.map(item => ({
                    student_id: item.student_id,
                    name: item.name,
                    value: item[field] !== undefined ? item[field] : item.average_marks
                }))
            });

            // Optimized early exit: if no elements were swapped in the pass, list is already sorted!
            if (!swapped) {
                break;
            }
        }

        const diff = process.hrtime(startTime);
        const executionTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(4);

        return {
            algorithm: 'Bubble Sort (Adaptive/Optimized)',
            timeComplexity: {
                best: 'O(n) (Already sorted)',
                average: 'O(n^2)',
                worst: 'O(n^2)'
            },
            spaceComplexity: 'O(1)',
            sortedBy: field,
            direction: direction.toUpperCase(),
            totalElements: n,
            totalComparisons,
            totalSwaps,
            totalPasses: passes.length,
            executionTimeMs: `${executionTimeMs} ms`,
            sortedData: arr,
            passes
        };
    }

    static sortByName(students, direction = 'asc') {
        return this.bubbleSort(students, 'name', direction);
    }

    static sortByAttendance(students, direction = 'desc') {
        return this.bubbleSort(students, 'attendance_percentage', direction);
    }

    static sortByMarks(students, direction = 'desc') {
        return this.bubbleSort(students, 'average_marks', direction);
    }
}

module.exports = SortingAlgorithms;