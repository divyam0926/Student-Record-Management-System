/**
 * Linked List Implementation
 * Used for Dynamic Student Record Management
 * Supports: Insert (head, tail), Delete by Student ID, Search, and Traversal
 */

class ListNode {
    constructor(data) {
        this.data = data; // Student object
        this.next = null;
    }
}

class StudentLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Insert student at beginning of the list
     * Time Complexity: O(1)
     */
    insertHead(student) {
        const newNode = new ListNode(student);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }
        this.size++;
        return {
            success: true,
            message: `Student ${student.name} (${student.student_id}) inserted at head.`,
            size: this.size
        };
    }

    /**
     * Insert student at the end of the list
     * Time Complexity: O(1) with tail pointer
     */
    insertTail(student) {
        const newNode = new ListNode(student);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
        return {
            success: true,
            message: `Student ${student.name} (${student.student_id}) inserted at tail.`,
            size: this.size
        };
    }

    /**
     * Delete student node by student_id
     * Time Complexity: O(n)
     */
    deleteById(studentId) {
        if (!this.head) {
            return { success: false, message: 'Linked List is empty.' };
        }

        const searchId = String(studentId).toLowerCase();
        const steps = [];

        // If head node is to be deleted
        if (String(this.head.data.student_id).toLowerCase() === searchId) {
            const deletedData = this.head.data;
            this.head = this.head.next;
            if (!this.head) {
                this.tail = null;
            }
            this.size--;
            return {
                success: true,
                message: `Deleted student ${deletedData.name} (${studentId}) from head.`,
                deleted: deletedData,
                size: this.size,
                steps: [`Examined head node [${deletedData.student_id}] -> Match found -> Updated head pointer`]
            };
        }

        let current = this.head;
        let prev = null;
        let index = 0;

        while (current && String(current.data.student_id).toLowerCase() !== searchId) {
            steps.push(`Step ${index + 1}: Checked node [${current.data.student_id}] (${current.data.name}) -> No match`);
            prev = current;
            current = current.next;
            index++;
        }

        if (!current) {
            return {
                success: false,
                message: `Student ID ${studentId} not found in Linked List.`,
                steps
            };
        }

        // Unlink node
        steps.push(`Step ${index + 1}: Match found at node [${current.data.student_id}]. Unlinked node.`);
        prev.next = current.next;
        if (current === this.tail) {
            this.tail = prev;
        }
        this.size--;

        return {
            success: true,
            message: `Deleted student ${current.data.name} (${studentId}).`,
            deleted: current.data,
            size: this.size,
            steps
        };
    }

    /**
     * Search for a student node by ID
     * Time Complexity: O(n)
     */
    searchById(studentId) {
        const searchId = String(studentId).toLowerCase();
        let current = this.head;
        let index = 0;
        const steps = [];

        while (current) {
            steps.push({
                index,
                student_id: current.data.student_id,
                name: current.data.name,
                matched: String(current.data.student_id).toLowerCase() === searchId
            });

            if (String(current.data.student_id).toLowerCase() === searchId) {
                return {
                    found: true,
                    student: current.data,
                    index,
                    steps,
                    comparisons: index + 1
                };
            }
            current = current.next;
            index++;
        }

        return {
            found: false,
            student: null,
            steps,
            comparisons: index
        };
    }

    /**
     * Traverse the list and return array of elements with step trace
     * Time Complexity: O(n)
     */
    traverse() {
        const result = [];
        const steps = [];
        let current = this.head;
        let index = 0;

        while (current) {
            result.push(current.data);
            steps.push({
                nodeIndex: index,
                student_id: current.data.student_id,
                name: current.data.name,
                course: current.data.course,
                hasNext: current.next !== null
            });
            current = current.next;
            index++;
        }

        return {
            elements: result,
            size: this.size,
            steps
        };
    }

    /**
     * Convert list to an array
     */
    toArray() {
        const arr = [];
        let curr = this.head;
        while (curr) {
            arr.push(curr.data);
            curr = curr.next;
        }
        return arr;
    }

    /**
     * Build linked list from an array
     */
    static fromArray(studentArray) {
        const list = new StudentLinkedList();
        for (const student of studentArray) {
            list.insertTail(student);
        }
        return list;
    }
}

module.exports = { StudentLinkedList, ListNode };