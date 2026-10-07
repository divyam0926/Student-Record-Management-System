/**
 * Graph Data Structure Implementation
 * Represents academic hierarchy: Department -> Course -> Students
 * Supports: Adjacency List construction, BFS (Breadth-First Search), DFS (Depth-First Search)
 */

class AcademicGraph {
    constructor() {
        this.adjacencyList = new Map();
        this.nodeDetails = new Map(); // stores type: 'department' | 'course' | 'student' and metadata
    }

    /**
     * Add a vertex/node to graph
     */
    addVertex(id, details = {}) {
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, []);
            this.nodeDetails.set(id, details);
        }
    }

    /**
     * Add a directed edge from source to destination
     */
    addEdge(source, destination) {
        if (!this.adjacencyList.has(source)) {
            this.addVertex(source);
        }
        if (!this.adjacencyList.has(destination)) {
            this.addVertex(destination);
        }
        if (!this.adjacencyList.get(source).includes(destination)) {
            this.adjacencyList.get(source).push(destination);
        }
    }

    /**
     * Build hierarchy graph from student records
     */
    static buildHierarchy(students) {
        const graph = new AcademicGraph();

        // Departments
        const deptMapping = {
            'MCA': 'School of Computer Applications',
            'Data Science': 'School of Computational & Data Sciences',
            'AI & ML': 'School of Artificial Intelligence',
            'B.Tech CSE': 'School of Engineering & Technology'
        };

        // Add root university vertex
        graph.addVertex('University', { label: 'Apex University', type: 'root' });

        for (const [course, dept] of Object.entries(deptMapping)) {
            graph.addVertex(dept, { label: dept, type: 'department' });
            graph.addEdge('University', dept);
            graph.addVertex(course, { label: course, type: 'course' });
            graph.addEdge(dept, course);
        }

        // Add students to their respective courses
        for (const student of students) {
            const stuNodeId = `${student.student_id}`;
            graph.addVertex(stuNodeId, {
                label: `${student.student_id}: ${student.name}`,
                type: 'student',
                course: student.course,
                semester: student.semester,
                name: student.name
            });

            if (student.course) {
                graph.addEdge(student.course, stuNodeId);
            }
        }

        return graph;
    }

    /**
     * Breadth-First Search (BFS) Traversal using a Queue
     * Explores level by level (University -> Departments -> Courses -> Students)
     * Time Complexity: O(V + E)
     */
    bfs(startNode = 'University') {
        if (!this.adjacencyList.has(startNode)) {
            return { success: false, message: `Node '${startNode}' does not exist in graph.` };
        }

        const visited = new Set();
        const queue = [startNode];
        const traversalOrder = [];
        const stepLogs = [];

        visited.add(startNode);
        stepLogs.push(`BFS Start: Enqueued start node [${startNode}]`);

        let step = 1;
        while (queue.length > 0) {
            const current = queue.shift();
            const details = this.nodeDetails.get(current) || {};
            traversalOrder.push({
                id: current,
                label: details.label || current,
                type: details.type || 'unknown'
            });

            const neighbors = this.adjacencyList.get(current) || [];
            stepLogs.push(
                `Step ${step++}: Dequeued [${current}] (Type: ${details.type || 'N/A'}). Neighbors: [${neighbors.join(', ')}]`
            );

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    stepLogs.push(`  -> Discovered & enqueued unvisited node: [${neighbor}]`);
                }
            }
        }

        return {
            success: true,
            algorithm: 'BFS (Breadth-First Search)',
            dataStructure: 'Queue (FIFO)',
            startNode,
            totalVisited: traversalOrder.length,
            traversalOrder,
            stepLogs
        };
    }

    /**
     * Depth-First Search (DFS) Traversal using Call Stack / Recursion
     * Explores deeply down one branch before backtracking
     * Time Complexity: O(V + E)
     */
    dfs(startNode = 'University') {
        if (!this.adjacencyList.has(startNode)) {
            return { success: false, message: `Node '${startNode}' does not exist in graph.` };
        }

        const visited = new Set();
        const traversalOrder = [];
        const stepLogs = [];
        let step = 1;

        const dfsHelper = (node, depth) => {
            visited.add(node);
            const details = this.nodeDetails.get(node) || {};
            const indent = '  '.repeat(depth);

            traversalOrder.push({
                id: node,
                label: details.label || node,
                type: details.type || 'unknown',
                depth
            });

            stepLogs.push(
                `Step ${step++}: ${indent}Visited [${node}] (Type: ${details.type || 'N/A'}, Depth: ${depth})`
            );

            const neighbors = this.adjacencyList.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    stepLogs.push(`${indent} -> Branching deeper into [${neighbor}]`);
                    dfsHelper(neighbor, depth + 1);
                }
            }
        };

        stepLogs.push(`DFS Start: Initiating recursive traversal from [${startNode}]`);
        dfsHelper(startNode, 0);

        return {
            success: true,
            algorithm: 'DFS (Depth-First Search)',
            dataStructure: 'Stack / Recursion (LIFO)',
            startNode,
            totalVisited: traversalOrder.length,
            traversalOrder,
            stepLogs
        };
    }

    /**
     * Return graph serialization for visual diagramming
     */
    toJSON() {
        const nodes = [];
        const edges = [];

        for (const [id, details] of this.nodeDetails.entries()) {
            nodes.push({ id, ...details });
        }

        for (const [source, targets] of this.adjacencyList.entries()) {
            for (const target of targets) {
                edges.push({ source, target });
            }
        }

        return { nodes, edges };
    }
}

module.exports = AcademicGraph;