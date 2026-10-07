/**
 * Algorithm Controller
 * REST API Controller for running and visualizing all 10 DSA implementations
 */

const StudentModel = require('../models/studentModel');
const { StudentLinkedList } = require('../algorithms/LinkedList');
const { ActionStack, undoStackInstance } = require('../algorithms/Stack');
const { StudentRegistrationQueue, registrationQueueInstance } = require('../algorithms/Queue');
const { StudentBST } = require('../algorithms/BST');
const AcademicGraph = require('../algorithms/Graph');
const SearchingAlgorithms = require('../algorithms/Searching');
const SortingAlgorithms = require('../algorithms/Sorting');
const GreedyScholarshipSystem = require('../algorithms/GreedyScholarship');
const DPTrendAnalysis = require('../algorithms/DPTrendAnalysis');
const BacktrackingCourseValidator = require('../algorithms/BacktrackingCourse');

// In-memory runtime instances for interactive playground
let runtimeLinkedList = null;
let runtimeBST = null;

class AlgorithmController {
    // -------------------------------------------------------------
    // 1. LINKED LIST
    // -------------------------------------------------------------
    static async getLinkedList(req, res) {
        try {
            if (!runtimeLinkedList) {
                const students = await StudentModel.getAll();
                runtimeLinkedList = StudentLinkedList.fromArray(students.slice(0, 8));
            }

            const traversal = runtimeLinkedList.traverse();
            res.status(200).json({
                success: true,
                size: runtimeLinkedList.size,
                data: traversal.elements,
                steps: traversal.steps
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async insertLinkedList(req, res) {
        try {
            const { student, position = 'tail' } = req.body;
            if (!runtimeLinkedList) {
                const students = await StudentModel.getAll();
                runtimeLinkedList = StudentLinkedList.fromArray(students.slice(0, 8));
            }

            const result = position === 'head' ?
                runtimeLinkedList.insertHead(student) :
                runtimeLinkedList.insertTail(student);

            const traversal = runtimeLinkedList.traverse();
            res.status(200).json({
                success: true,
                ...result,
                traversal
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async deleteLinkedList(req, res) {
        try {
            const { studentId } = req.params;
            if (!runtimeLinkedList) {
                return res.status(400).json({ success: false, message: 'Linked list not initialized.' });
            }

            const result = runtimeLinkedList.deleteById(studentId);
            const traversal = runtimeLinkedList.traverse();
            res.status(200).json({
                ...result,
                traversal
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 2. STACK (UNDO FUNCTIONALITY)
    // -------------------------------------------------------------
    static async getStack(req, res) {
        try {
            res.status(200).json({
                success: true,
                size: undoStackInstance.size(),
                isEmpty: undoStackInstance.isEmpty(),
                peek: undoStackInstance.peek(),
                stackItems: undoStackInstance.toArray()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async popStack(req, res) {
        try {
            const result = undoStackInstance.pop();
            res.status(200).json({
                ...result,
                stackItems: undoStackInstance.toArray()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 3. QUEUE (STUDENT REGISTRATION)
    // -------------------------------------------------------------
    static async getQueue(req, res) {
        try {
            res.status(200).json({
                success: true,
                size: registrationQueueInstance.size(),
                isEmpty: registrationQueueInstance.isEmpty(),
                front: registrationQueueInstance.front(),
                queueItems: registrationQueueInstance.displayQueue()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async enqueue(req, res) {
        try {
            const { name, email, phone, course, semester } = req.body;
            if (!name || !email) {
                return res.status(400).json({ success: false, message: 'Name and email are required.' });
            }

            const result = registrationQueueInstance.enqueue({ name, email, phone, course, semester });
            res.status(201).json({
                ...result,
                queueItems: registrationQueueInstance.displayQueue()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async dequeue(req, res) {
        try {
            const result = registrationQueueInstance.dequeue();
            res.status(200).json({
                ...result,
                queueItems: registrationQueueInstance.displayQueue()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 4. BINARY SEARCH TREE (BST)
    // -------------------------------------------------------------
    static async getBST(req, res) {
        try {
            if (!runtimeBST) {
                const students = await StudentModel.getAll();
                runtimeBST = StudentBST.fromArray(students);
            }

            res.status(200).json({
                success: true,
                nodeCount: runtimeBST.nodeCount,
                treeVisual: runtimeBST.getTreeVisualData(),
                inorder: runtimeBST.inorderTraversal(),
                preorder: runtimeBST.preorderTraversal(),
                postorder: runtimeBST.postorderTraversal()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async searchBST(req, res) {
        try {
            const { studentId } = req.params;
            if (!runtimeBST) {
                const students = await StudentModel.getAll();
                runtimeBST = StudentBST.fromArray(students);
            }

            const result = runtimeBST.search(studentId);
            res.status(200).json({
                ...result,
                treeVisual: runtimeBST.getTreeVisualData()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async insertBST(req, res) {
        try {
            const { student } = req.body;
            if (!runtimeBST) {
                const students = await StudentModel.getAll();
                runtimeBST = StudentBST.fromArray(students);
            }

            const result = runtimeBST.insert(student);
            res.status(200).json({
                ...result,
                treeVisual: runtimeBST.getTreeVisualData(),
                inorder: runtimeBST.inorderTraversal()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 5. GRAPH + BFS + DFS
    // -------------------------------------------------------------
    static async getGraph(req, res) {
        try {
            const students = await StudentModel.getAll();
            const graph = AcademicGraph.buildHierarchy(students);
            const bfsResult = graph.bfs('University');
            const dfsResult = graph.dfs('University');

            res.status(200).json({
                success: true,
                graphData: graph.toJSON(),
                bfsResult,
                dfsResult
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 6. SEARCHING ALGORITHMS
    // -------------------------------------------------------------
    static async runLinearSearch(req, res) {
        try {
            const query = req.query.query || req.body.query || '';
            const students = await StudentModel.getAll();
            const result = SearchingAlgorithms.linearSearchByName(students, query);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async runBinarySearch(req, res) {
        try {
            const studentId = req.query.studentId || req.body.studentId || '';
            const students = await StudentModel.getAll();
            const result = SearchingAlgorithms.binarySearchById(students, studentId);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 7. SORTING ALGORITHMS
    // -------------------------------------------------------------
    static async runBubbleSort(req, res) {
        try {
            const { field = 'name', direction = 'asc' } = req.query;
            const students = await StudentModel.getAll();
            const result = SortingAlgorithms.bubbleSort(students, field, direction);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 8. GREEDY SCHOLARSHIP
    // -------------------------------------------------------------
    static async runGreedyScholarship(req, res) {
        try {
            const students = await StudentModel.getAll();
            const quota = parseInt(req.query.quota || req.body.quota || '5', 10);
            const result = GreedyScholarshipSystem.selectScholarshipRecipients(students, { quota });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 9. DYNAMIC PROGRAMMING TREND
    // -------------------------------------------------------------
    static async runDPTrend(req, res) {
        try {
            const { studentId } = req.query;
            let trajectory;

            if (studentId) {
                const student = await StudentModel.getById(studentId);
                trajectory = DPTrendAnalysis.getSampleTrajectory(
                    studentId,
                    student ? Number(student.average_marks || 80) : 80,
                    student ? student.semester : 4
                );
            } else {
                // Default sample trajectory
                trajectory = DPTrendAnalysis.analyzeStudentTrajectory([
                    { semester: 1, averageMarks: 72.5 },
                    { semester: 2, averageMarks: 75.0 },
                    { semester: 3, averageMarks: 71.0 },
                    { semester: 4, averageMarks: 83.5 },
                    { semester: 5, averageMarks: 88.0 },
                    { semester: 6, averageMarks: 92.5 }
                ]);
            }

            res.status(200).json({ success: true, ...trajectory });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 10. BACKTRACKING COURSE VALIDATION
    // -------------------------------------------------------------
    static async runBacktrackingCourse(req, res) {
        try {
            const completed = req.body.completedCourses || ['CS101'];
            const targetCount = parseInt(req.body.targetCoursesCount || '3', 10);
            const maxCredits = parseInt(req.body.maxCredits || '11', 10);

            const result = BacktrackingCourseValidator.generateValidCoursePlans(completed, targetCount, maxCredits);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = AlgorithmController;