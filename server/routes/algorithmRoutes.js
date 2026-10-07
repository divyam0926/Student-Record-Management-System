/**
 * Algorithm Routes
 * Exposes API endpoints for testing and visualizing all 10 DSA implementations
 */

const express = require('express');
const router = express.Router();
const AlgorithmController = require('../controllers/algorithmController');

// 1. Linked List
router.get('/linked-list', AlgorithmController.getLinkedList);
router.post('/linked-list/insert', AlgorithmController.insertLinkedList);
router.delete('/linked-list/:studentId', AlgorithmController.deleteLinkedList);

// 2. Stack (Undo)
router.get('/stack', AlgorithmController.getStack);
router.post('/stack/pop', AlgorithmController.popStack);

// 3. Queue (Registration)
router.get('/queue', AlgorithmController.getQueue);
router.post('/queue/enqueue', AlgorithmController.enqueue);
router.post('/queue/dequeue', AlgorithmController.dequeue);

// 4. BST
router.get('/bst', AlgorithmController.getBST);
router.get('/bst/search/:studentId', AlgorithmController.searchBST);
router.post('/bst/insert', AlgorithmController.insertBST);

// 5. Graph
router.get('/graph', AlgorithmController.getGraph);

// 6. Searching
router.get('/search/linear', AlgorithmController.runLinearSearch);
router.post('/search/linear', AlgorithmController.runLinearSearch);
router.get('/search/binary', AlgorithmController.runBinarySearch);
router.post('/search/binary', AlgorithmController.runBinarySearch);

// 7. Sorting
router.get('/sort/bubble', AlgorithmController.runBubbleSort);

// 8. Greedy
router.get('/greedy/scholarship', AlgorithmController.runGreedyScholarship);
router.post('/greedy/scholarship', AlgorithmController.runGreedyScholarship);

// 9. Dynamic Programming
router.get('/dp/trend', AlgorithmController.runDPTrend);

// 10. Backtracking
router.get('/backtracking/courses', AlgorithmController.runBacktrackingCourse);
router.post('/backtracking/courses', AlgorithmController.runBacktrackingCourse);

module.exports = router;