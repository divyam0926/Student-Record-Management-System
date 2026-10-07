/**
 * Binary Search Tree (BST) Implementation
 * Keyed by Student ID (e.g. STU-1001 -> 1001 or alphanumeric comparison)
 * Supports: Insert, Search, Delete, Inorder Traversal, and Tree Visualization serialization
 */

class BSTNode {
    constructor(student) {
        this.key = BSTNode.extractKey(student.student_id);
        this.studentId = student.student_id;
        this.data = student;
        this.left = null;
        this.right = null;
    }

    static extractKey(idStr) {
        // Extract digits if present, or compare raw string
        const match = String(idStr).match(/\d+/);
        return match ? parseInt(match[0], 10) : String(idStr).toLowerCase();
    }
}

class StudentBST {
    constructor() {
        this.root = null;
        this.nodeCount = 0;
    }

    /**
     * Insert a student record into the BST
     * Time Complexity: O(log n) average, O(n) worst-case
     */
    insert(student) {
        const newNode = new BSTNode(student);
        const steps = [];

        if (!this.root) {
            this.root = newNode;
            this.nodeCount++;
            steps.push(`Tree was empty. Set [${student.student_id}] (${student.name}) as Root node.`);
            return { success: true, node: newNode, steps, count: this.nodeCount };
        }

        let current = this.root;
        while (true) {
            if (newNode.key === current.key) {
                // Update existing data
                current.data = student;
                steps.push(`Key [${newNode.key}] already exists. Updated existing node [${student.student_id}].`);
                return { success: true, node: current, steps, updated: true };
            }

            if (newNode.key < current.key) {
                steps.push(`Comparing: ${newNode.key} < ${current.key} ([${current.studentId}]). Moving LEFT.`);
                if (!current.left) {
                    current.left = newNode;
                    this.nodeCount++;
                    steps.push(`Inserted [${student.student_id}] as LEFT child of [${current.studentId}].`);
                    break;
                }
                current = current.left;
            } else {
                steps.push(`Comparing: ${newNode.key} > ${current.key} ([${current.studentId}]). Moving RIGHT.`);
                if (!current.right) {
                    current.right = newNode;
                    this.nodeCount++;
                    steps.push(`Inserted [${student.student_id}] as RIGHT child of [${current.studentId}].`);
                    break;
                }
                current = current.right;
            }
        }

        return { success: true, node: newNode, steps, count: this.nodeCount };
    }

    /**
     * Search for a student by ID
     * Time Complexity: O(log n) average, O(n) worst-case
     */
    search(studentId) {
        const targetKey = BSTNode.extractKey(studentId);
        let current = this.root;
        let comparisons = 0;
        const path = [];

        while (current) {
            comparisons++;
            path.push({
                nodeId: current.studentId,
                nodeName: current.data.name,
                key: current.key,
                action: targetKey === current.key ? 'FOUND' : targetKey < current.key ? 'GO_LEFT' : 'GO_RIGHT'
            });

            if (targetKey === current.key) {
                return {
                    found: true,
                    student: current.data,
                    comparisons,
                    path,
                    message: `Found student ${current.data.name} in ${comparisons} comparison(s).`
                };
            }

            if (targetKey < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return {
            found: false,
            student: null,
            comparisons,
            path,
            message: `Student ID ${studentId} not found in BST after ${comparisons} comparison(s).`
        };
    }

    /**
     * Delete a student by ID
     */
    delete(studentId) {
        const targetKey = BSTNode.extractKey(studentId);
        let deletedNode = null;
        const steps = [];

        const deleteNode = (root, key) => {
            if (!root) {
                steps.push(`Reached null subtree. Key ${key} not found.`);
                return null;
            }

            if (key < root.key) {
                steps.push(`Key ${key} < ${root.key} ([${root.studentId}]). Traversing left.`);
                root.left = deleteNode(root.left, key);
                return root;
            } else if (key > root.key) {
                steps.push(`Key ${key} > ${root.key} ([${root.studentId}]). Traversing right.`);
                root.right = deleteNode(root.right, key);
                return root;
            } else {
                // Node found
                deletedNode = root.data;

                // Case 1: Leaf node (no children)
                if (!root.left && !root.right) {
                    steps.push(`Node [${root.studentId}] is a leaf node. Removed directly.`);
                    return null;
                }

                // Case 2: One child
                if (!root.left) {
                    steps.push(`Node [${root.studentId}] has only right child. Replaced with right child.`);
                    return root.right;
                }
                if (!root.right) {
                    steps.push(`Node [${root.studentId}] has only left child. Replaced with left child.`);
                    return root.left;
                }

                // Case 3: Two children
                // Find in-order successor (smallest node in right subtree)
                let successorParent = root;
                let successor = root.right;
                while (successor.left) {
                    successorParent = successor;
                    successor = successor.left;
                }

                steps.push(`Node [${root.studentId}] has two children. Replaced with in-order successor [${successor.studentId}].`);

                root.key = successor.key;
                root.studentId = successor.studentId;
                root.data = successor.data;

                if (successorParent !== root) {
                    successorParent.left = successor.right;
                } else {
                    successorParent.right = successor.right;
                }

                return root;
            }
        };

        this.root = deleteNode(this.root, targetKey);
        if (deletedNode) {
            this.nodeCount--;
            return { success: true, deleted: deletedNode, steps, count: this.nodeCount };
        } else {
            return { success: false, message: `Student ID ${studentId} not found.`, steps };
        }
    }

    /**
     * In-Order Traversal (Left -> Root -> Right)
     * Produces sorted order by Student ID
     */
    inorderTraversal() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            traverse(node.left);
            result.push(node.data);
            traverse(node.right);
        };
        traverse(this.root);
        return result;
    }

    /**
     * Pre-Order Traversal (Root -> Left -> Right)
     */
    preorderTraversal() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            result.push(node.data);
            traverse(node.left);
            traverse(node.right);
        };
        traverse(this.root);
        return result;
    }

    /**
     * Post-Order Traversal (Left -> Right -> Root)
     */
    postorderTraversal() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            traverse(node.left);
            traverse(node.right);
            result.push(node.data);
        };
        traverse(this.root);
        return result;
    }

    /**
     * Serialize tree for frontend visualization
     */
    getTreeVisualData() {
        const serializeNode = (node) => {
            if (!node) return null;
            return {
                key: node.key,
                studentId: node.studentId,
                name: node.data.name,
                course: node.data.course,
                left: serializeNode(node.left),
                right: serializeNode(node.right)
            };
        };
        return serializeNode(this.root);
    }

    /**
     * Build BST from student array
     */
    static fromArray(studentArray) {
        const bst = new StudentBST();
        for (const student of studentArray) {
            bst.insert(student);
        }
        return bst;
    }
}

module.exports = { StudentBST, BSTNode };