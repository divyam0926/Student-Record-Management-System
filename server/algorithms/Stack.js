/**
 * Stack Implementation (LIFO - Last In First Out)
 * Used for Undo Functionality in Student Management
 * Allows rolling back the most recent student additions, updates, and deletions
 */

class ActionStack {
    constructor(maxSize = 50) {
        this.items = [];
        this.maxSize = maxSize;
    }

    /**
     * Push an action record onto the stack
     * Time Complexity: O(1)
     */
    push(actionRecord) {
        if (this.items.length >= this.maxSize) {
            this.items.shift(); // Remove oldest to maintain max history
        }

        const item = {
            ...actionRecord,
            timestamp: actionRecord.timestamp || new Date().toISOString()
        };

        this.items.push(item);
        return {
            success: true,
            message: `Pushed action '${item.type}' for student ${item.studentId || item.data?.student_id} to Undo Stack.`,
            currentSize: this.items.length,
            topItem: item
        };
    }

    /**
     * Pop the most recent action from the stack
     * Time Complexity: O(1)
     */
    pop() {
        if (this.isEmpty()) {
            return {
                success: false,
                message: 'Undo Stack is empty. No actions to undo.',
                item: null
            };
        }

        const popped = this.items.pop();
        return {
            success: true,
            message: `Popped action '${popped.type}' from Undo Stack.`,
            item: popped,
            currentSize: this.items.length
        };
    }

    /**
     * Inspect top element without removing
     * Time Complexity: O(1)
     */
    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }

    /**
     * Check if stack has elements
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Return current number of elements
     */
    size() {
        return this.items.length;
    }

    /**
     * Empty the stack
     */
    clear() {
        this.items = [];
    }

    /**
     * Get all elements as array (top of stack first)
     */
    toArray() {
        return [...this.items].reverse();
    }
}

// Global server-side instance for application lifecycle
const undoStackInstance = new ActionStack();

module.exports = { ActionStack, undoStackInstance };