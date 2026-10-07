/**
 * Queue Implementation (FIFO - First In First Out)
 * Used for Student Registration Processing Queue
 * Manages applicants waiting for verification and course allotment
 */

class StudentRegistrationQueue {
    constructor() {
        this.items = [];
    }

    /**
     * Enqueue a new registration application
     * Time Complexity: O(1)
     */
    enqueue(applicant) {
        const ticketNumber = `REG-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
        const record = {
            ...applicant,
            ticketNumber,
            registeredAt: new Date().toISOString(),
            status: 'Pending Verification'
        };

        this.items.push(record);
        return {
            success: true,
            message: `Applicant ${record.name} added to registration queue with Ticket #${ticketNumber}.`,
            position: this.items.length,
            ticketNumber,
            applicant: record
        };
    }

    /**
     * Dequeue and process the student at the front of the queue
     * Time Complexity: O(n) with array shift, or O(1) with pointer
     */
    dequeue() {
        if (this.isEmpty()) {
            return {
                success: false,
                message: 'Registration queue is empty. No pending applicants to process.',
                applicant: null
            };
        }

        const processed = this.items.shift();
        processed.status = 'Approved & Registered';
        processed.processedAt = new Date().toISOString();

        return {
            success: true,
            message: `Processed registration for ${processed.name} (Ticket: ${processed.ticketNumber}).`,
            applicant: processed,
            remainingInQueue: this.items.length
        };
    }

    /**
     * Peek at the front applicant without dequeuing
     */
    front() {
        if (this.isEmpty()) return null;
        return this.items[0];
    }

    /**
     * Peek at the rear applicant
     */
    rear() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }

    /**
     * Check if queue is empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get queue size
     */
    size() {
        return this.items.length;
    }

    /**
     * Clear all items
     */
    clear() {
        this.items = [];
    }

    /**
     * Display all items in queue order (front to rear)
     */
    displayQueue() {
        return this.items.map((item, index) => ({
            queuePosition: index + 1,
            ...item
        }));
    }
}

// Global server instance preloaded with a couple of pending demo applicants
const registrationQueueInstance = new StudentRegistrationQueue();
registrationQueueInstance.enqueue({
    name: 'Vikash Kashyap',
    email: 'vikash.k@kristujayanti.com',
    phone: '9811223344',
    course: 'MCA',
    semester: 1
});
registrationQueueInstance.enqueue({
    name: 'Ritika Sen',
    email: 'ritika.sen@kristujayanti.com',
    phone: '9822334455',
    course: 'Data Science',
    semester: 1
});

module.exports = { StudentRegistrationQueue, registrationQueueInstance };