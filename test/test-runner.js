/**
 * Automated Verification Test Suite
 * Tests all 10 Data Structures & Algorithms implementations
 */

const assert = require('assert');
const { StudentLinkedList } = require('../server/algorithms/LinkedList');
const { ActionStack } = require('../server/algorithms/Stack');
const { StudentRegistrationQueue } = require('../server/algorithms/Queue');
const { StudentBST } = require('../server/algorithms/BST');
const AcademicGraph = require('../server/algorithms/Graph');
const SearchingAlgorithms = require('../server/algorithms/Searching');
const SortingAlgorithms = require('../server/algorithms/Sorting');
const GreedyScholarshipSystem = require('../server/algorithms/GreedyScholarship');
const DPTrendAnalysis = require('../server/algorithms/DPTrendAnalysis');
const BacktrackingCourseValidator = require('../server/algorithms/BacktrackingCourse');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
        failed++;
    }
}

console.log('----------------------------------------------------');
console.log('Running DSA Mini Project Verification Suite...');
console.log('----------------------------------------------------');

// Test 1: Linked List
runTest('1. Linked List - Insert Head, Tail, Traverse & Delete', () => {
    const ll = new StudentLinkedList();
    ll.insertHead({ student_id: 'STU-1002', name: 'Bob' });
    ll.insertHead({ student_id: 'STU-1001', name: 'Alice' });
    ll.insertTail({ student_id: 'STU-1003', name: 'Charlie' });
    assert.strictEqual(ll.size, 3);

    const trav = ll.traverse();
    assert.strictEqual(trav.elements[0].name, 'Alice');
    assert.strictEqual(trav.elements[2].name, 'Charlie');

    const del = ll.deleteById('STU-1002');
    assert.strictEqual(del.success, true);
    assert.strictEqual(ll.size, 2);
});

// Test 2: Stack (Undo)
runTest('2. Stack - Push, Pop, Peek & LIFO Invariant', () => {
    const stack = new ActionStack();
    stack.push({ type: 'INSERT', studentId: 'STU-1001' });
    stack.push({ type: 'UPDATE', studentId: 'STU-1001' });
    assert.strictEqual(stack.size(), 2);
    assert.strictEqual(stack.peek().type, 'UPDATE');

    const popResult = stack.pop();
    assert.strictEqual(popResult.item.type, 'UPDATE');
    assert.strictEqual(stack.size(), 1);
});

// Test 3: Queue (Student Registration FIFO)
runTest('3. Queue - Enqueue, Dequeue & FIFO Invariant', () => {
    const queue = new StudentRegistrationQueue();
    queue.enqueue({ name: 'Applicant 1' });
    queue.enqueue({ name: 'Applicant 2' });
    assert.strictEqual(queue.size(), 2);
    assert.strictEqual(queue.front().name, 'Applicant 1');

    const deq = queue.dequeue();
    assert.strictEqual(deq.applicant.name, 'Applicant 1');
    assert.strictEqual(queue.size(), 1);
    assert.strictEqual(queue.front().name, 'Applicant 2');
});

// Test 4: Binary Search Tree
runTest('4. BST - Insert, Search, Inorder (Sorted ID) & Delete', () => {
    const bst = new StudentBST();
    bst.insert({ student_id: 'STU-1005', name: 'Student 5' });
    bst.insert({ student_id: 'STU-1002', name: 'Student 2' });
    bst.insert({ student_id: 'STU-1008', name: 'Student 8' });

    const searchRes = bst.search('STU-1002');
    assert.strictEqual(searchRes.found, true);
    assert.strictEqual(searchRes.student.name, 'Student 2');

    const inorder = bst.inorderTraversal();
    assert.strictEqual(inorder[0].student_id, 'STU-1002');
    assert.strictEqual(inorder[1].student_id, 'STU-1005');
    assert.strictEqual(inorder[2].student_id, 'STU-1008');

    bst.delete('STU-1002');
    const searchAfterDel = bst.search('STU-1002');
    assert.strictEqual(searchAfterDel.found, false);
});

// Test 5: Graph BFS & DFS
runTest('5. Academic Graph - Hierarchy BFS & DFS Traversal', () => {
    const sampleStudents = [
        { student_id: 'STU-1001', name: 'Aarav', course: 'MCA' },
        { student_id: 'STU-1002', name: 'Diya', course: 'MCA' },
        { student_id: 'STU-1003', name: 'Rohan', course: 'Data Science' }
    ];
    const graph = AcademicGraph.buildHierarchy(sampleStudents);
    const bfs = graph.bfs('University');
    assert.strictEqual(bfs.success, true);
    assert.ok(bfs.totalVisited > 3);

    const dfs = graph.dfs('University');
    assert.strictEqual(dfs.success, true);
    assert.strictEqual(dfs.totalVisited, bfs.totalVisited);
});

// Test 6: Searching
runTest('6. Searching - Linear Search (Name) & Binary Search (ID)', () => {
    const list = [
        { student_id: 'STU-1001', name: 'Aarav Sharma' },
        { student_id: 'STU-1002', name: 'Diya Patel' },
        { student_id: 'STU-1003', name: 'Rohan Verma' }
    ];

    const lin = SearchingAlgorithms.linearSearchByName(list, 'Diya');
    assert.strictEqual(lin.found, true);
    assert.strictEqual(lin.matches[0].student_id, 'STU-1002');

    const bin = SearchingAlgorithms.binarySearchById(list, 'STU-1003');
    assert.strictEqual(bin.found, true);
    assert.strictEqual(bin.student.name, 'Rohan Verma');
});

// Test 7: Sorting
runTest('7. Sorting - Bubble Sort for Marks & Names', () => {
    const list = [
        { student_id: 'A', name: 'Charlie', average_marks: 70 },
        { student_id: 'B', name: 'Alice', average_marks: 95 },
        { student_id: 'C', name: 'Bob', average_marks: 85 }
    ];

    const sortedMarks = SortingAlgorithms.sortByMarks(list, 'desc');
    assert.strictEqual(sortedMarks.sortedData[0].name, 'Alice');
    assert.strictEqual(sortedMarks.sortedData[2].name, 'Charlie');

    const sortedNames = SortingAlgorithms.sortByName(list, 'asc');
    assert.strictEqual(sortedNames.sortedData[0].name, 'Alice');
    assert.strictEqual(sortedNames.sortedData[2].name, 'Charlie');
});

// Test 8: Greedy Scholarship
runTest('8. Greedy Algorithm - Scholarship Selection (Attendance >85% & Marks >80%)', () => {
    const students = [
        { student_id: 'S1', name: 'High Attendance Low Marks', attendance_percentage: 95, average_marks: 70 },
        { student_id: 'S2', name: 'Eligible Star', attendance_percentage: 92, average_marks: 90 },
        { student_id: 'S3', name: 'Eligible Merit', attendance_percentage: 88, average_marks: 85 },
        { student_id: 'S4', name: 'Low Attendance', attendance_percentage: 80, average_marks: 94 }
    ];

    const res = GreedyScholarshipSystem.selectScholarshipRecipients(students, { quota: 2 });
    assert.strictEqual(res.summary.eligibleCount, 2);
    assert.strictEqual(res.selectedRecipients[0].name, 'Eligible Star');
});

// Test 9: Dynamic Programming Trend Analysis
runTest('9. Dynamic Programming - Longest Non-Decreasing Performance Streak', () => {
    const semMarks = [
        { semester: 1, averageMarks: 70 },
        { semester: 2, averageMarks: 68 },
        { semester: 3, averageMarks: 75 },
        { semester: 4, averageMarks: 80 },
        { semester: 5, averageMarks: 78 },
        { semester: 6, averageMarks: 85 }
    ];

    const dpRes = DPTrendAnalysis.analyzeStudentTrajectory(semMarks);
    assert.ok(dpRes.maxContinuousGrowthStreak >= 4); // 70 -> 75 -> 80 -> 85
    assert.strictEqual(dpRes.dpTable.length, 6);
});

// Test 10: Backtracking Course Validation
runTest('10. Backtracking - Prerequisite & Credit Constraint Validation', () => {
    const completed = ['CS101'];
    const res = BacktrackingCourseValidator.generateValidCoursePlans(completed, 2, 8);
    assert.ok(res.statistics.validCombinationsFound > 0);
    assert.ok(res.statistics.prunedBranchesCount >= 0);
});

console.log('----------------------------------------------------');
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log('----------------------------------------------------');

if (failed > 0) {
    process.exit(1);
} else {
    console.log('All DSA verification tests passed successfully!');
}