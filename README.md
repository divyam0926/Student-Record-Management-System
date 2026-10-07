# Student Record Management System (SRMS)
### Data Structures & Algorithmic Techniques Mini Project (MCA / B.Tech CSE)

A complete, production-ready Full Stack Web Application engineered for academic institutions to manage student records, track attendance, evaluate examination marks, generate administrative reports, and demonstrate core **Data Structures and Algorithmic Techniques** through an interactive visual playground.

---

## 📑 Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Structures & Algorithms Implementation](#data-structures--algorithms-implementation)
5. [Database Design](#database-design)
6. [Project Structure](#project-structure)
7. [Installation & Setup](#installation--setup)
8. [REST API Documentation](#rest-api-documentation)
9. [Verification & Testing](#verification--testing)
10. [Export Options (PDF & Excel)](#export-options-pdf--excel)

---

## 🌟 Key Features

* **Student Lifecycle Management**: Complete CRUD operations for student profiles with validation, live search, multi-column sorting, and pagination.
* **Attendance Tracking Module**: Automatic percentage calculations with threshold indicators (High &gt; 85%, Satisfactory 75–85%, Defaulter &lt; 75%).
* **Marks & Grading Engine**: Subject-wise internal and external evaluations with automated letter grade calculation ($90+ \to \text{A+}$, $80+ \to \text{A}$, $70+ \to \text{B+}$, $60+ \to \text{B}$, $50+ \to \text{C}$, $< 50 \to \text{F}$).
* **Action Undo System (Stack-Powered)**: Instant rollback for deleted or modified student records.
* **Reports & Analytics Center**: Comprehensive student dossiers, attendance defaulter lists, grade distribution analytics, Dean's honor roll, and scholarship awards.
* **Document Export**: One-click export to **PDF** (landscape document format) and **Excel spreadsheets** (.xlsx).
* **Dual-Mode Database Layer**: Native MySQL 8.0 connection pool with automatic schema generation and sample data seeding, backed by a seamless in-memory fallback.
* **Dark / Light Theme Toggle**: Persistent user theme preference stored in `localStorage`.
* **DSA Visualizer Playground**: Dedicated interactive module demonstrating 10 core computer science data structures and algorithmic paradigms with live traces.

---

## 💻 Technology Stack

### Frontend
- **HTML5 & CSS3**: Responsive UI, CSS custom variables, Flexbox & CSS Grid, Glassmorphism accents.
- **JavaScript (Vanilla JS - ES6+)**: Native modular JavaScript without heavy framework dependencies.
- **Chart.js**: Dynamic interactive data visualization for enrollment, grade distributions, and DP trajectories.
- **SheetJS (xlsx)**: Client-side Excel spreadsheet generation and download.
- **html2pdf.js / jsPDF**: Client-side styled PDF generation and report printing.
- **FontAwesome 6**: Modern iconography.

### Backend
- **Node.js (v18+)**: High-performance asynchronous runtime.
- **Express.js (v4.x)**: Modular RESTful API server.
- **mysql2/promise**: Fast MySQL connection pooling and parameterized queries.
- **jsonwebtoken (JWT)**: Stateless token authentication for secure admin access.
- **bcryptjs**: Secure password hashing.
- **cors & dotenv**: Cross-origin resource sharing and environment management.

### Database
- **MySQL 8.0 Server**: Relational database with Foreign Key cascades, indexes, and generated columns.

---

## 🏛️ System Architecture

The application follows a **3-Tier Client-Server Architecture**:

```
+-------------------------------------------------------------+
|                     PRESENTATION TIER                       |
|           Vanilla JS SPA (HTML5, CSS3, Chart.js)            |
|   Dashboard | Students | Attendance | Marks | Reports | DSA   |
+------------------------------+------------------------------+
                               |
                        REST APIs (HTTP/JSON)
                               |
+------------------------------v------------------------------+
|                     APPLICATION TIER                        |
|                     Node.js + Express.js                    |
|   Routes -> Middleware -> Controllers -> Models -> DSA Core |
+------------------------------+------------------------------+
                               |
                    mysql2 Connection Pool
                               |
+------------------------------v------------------------------+
|                        DATA TIER                            |
|             MySQL 8.0 Server (student_management_db)        |
|          Tables: users, students, attendance, marks         |
+-------------------------------------------------------------+
```

---

## 🧩 Data Structures & Algorithms Implementation

This project specifically implements and visualizes 10 algorithmic concepts required for an MCA Mini Project:

| # | Data Structure / Algorithm | Application in SRMS | Time Complexity | Space Complexity |
|---|---|---|---|---|
| 1 | **Singly Linked List** | Dynamic Student Record Insertion (Head/Tail), Deletion, and Linear Traversal | Insert: $O(1)$<br>Search/Delete: $O(n)$ | $O(n)$ |
| 2 | **Stack (LIFO)** | System Undo Manager: Rolls back student additions, updates, and deletions | Push/Pop: $O(1)$ | $O(k)$ history |
| 3 | **Queue (FIFO)** | Student Registration Queue: Manages incoming admission applicants in arrival order | Enqueue/Dequeue: $O(1)$ | $O(n)$ |
| 4 | **Binary Search Tree (BST)** | Indexed Student Tree by ID: Fast search, insertion, deletion, and Inorder traversal | Average: $O(\log n)$<br>Worst: $O(n)$ | $O(n)$ |
| 5 | **Graph + BFS + DFS** | University Academic Hierarchy (`University` $\to$ `Department` $\to$ `Course` $\to$ `Students`) | $O(V + E)$ | $O(V)$ |
| 6 | **Linear Search** | Substring name search across student records | Best: $O(1)$<br>Worst: $O(n)$ | $O(1)$ |
| 7 | **Binary Search** | Divide-and-conquer search by numeric/alphanumeric Student ID on sorted array | $O(\log n)$ | $O(1)$ |
| 8 | **Bubble Sort (Adaptive)** | Sorts students by Name (A-Z), Attendance %, and Marks with early-exit flag | Best: $O(n)$<br>Worst: $O(n^2)$ | $O(1)$ in-place |
| 9 | **Greedy Algorithm** | Merit Scholarship Allocation: Filters Attendance $> 85\%$ & Marks $> 80\%$, sorts by merit score, allocates seats under budget/quota | $O(n \log n)$ | $O(n)$ |
| 10 | **Dynamic Programming (DP)** | Semester-wise Performance Trend Analysis: Longest Non-Decreasing Performance Streak ($dp[i] = 1 + \max(dp[j])$) | $O(n^2)$ | $O(n)$ |
| 11 | **Backtracking** | Course Schedule & Prerequisite Validation: Branch & bound prerequisite checking with constraint pruning | $O(b^d)$ with pruning | $O(d)$ recursion depth |

---

## 🗄️ Database Design

### Database Name: `student_management_db`

#### 1. `users` Table
Stores administrative credentials for authentication.
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `students` Table
Core demographic and enrollment details.
```sql
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    course VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `attendance` Table
Class attendance tracking linked via foreign key.
```sql
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    total_classes INT NOT NULL DEFAULT 0,
    attended_classes INT NOT NULL DEFAULT 0,
    attendance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_classes > 0 THEN ROUND((attended_classes / total_classes) * 100, 2) ELSE 0.00 END
    ) STORED,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
```

#### 4. `marks` Table
Academic subject assessment results.
```sql
CREATE TABLE marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    internal_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    external_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_marks DECIMAL(5,2) GENERATED ALWAYS AS (internal_marks + external_marks) STORED,
    grade VARCHAR(5) NOT NULL,
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
```

---

## 📁 Project Structure

```
student-record-management-system/
├── client/                     # Frontend SPA
│   ├── index.html              # Master Single Page Application view
│   ├── css/
│   │   ├── styles.css          # Main responsive design & dark mode
│   │   └── dsa.css             # Visualizer nodes, trees & stacks
│   ├── js/
│   │   ├── api.js              # Fetch client wrapper
│   │   ├── auth.js             # Authentication & session state
│   │   ├── dashboard.js        # KPI cards & Chart.js integration
│   │   ├── students.js         # Student CRUD, search, sort, pagination
│   │   ├── attendance.js       # Attendance management & auto %
│   │   ├── marks.js            # Marks CRUD & automated grade mapping
│   │   ├── reports.js          # Reports generation & PDF/Excel export
│   │   ├── dsa.js              # Interactive 10-DSA visualizers
│   │   └── app.js              # App bootstrap & toast notification manager
│   └── assets/                 # Icons & images
├── server/                     # Backend Express.js Server
│   ├── config/
│   │   └── db.js               # MySQL 8.0 pool & in-memory fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── attendanceController.js
│   │   ├── markController.js
│   │   ├── reportController.js
│   │   └── algorithmController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── markRoutes.js
│   │   ├── reportRoutes.js
│   │   └── algorithmRoutes.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── studentModel.js
│   │   ├── attendanceModel.js
│   │   └── markModel.js
│   ├── algorithms/             # Clean DSA implementations
│   │   ├── LinkedList.js
│   │   ├── Stack.js
│   │   ├── Queue.js
│   │   ├── BST.js
│   │   ├── Graph.js
│   │   ├── Searching.js
│   │   ├── Sorting.js
│   │   ├── GreedyScholarship.js
│   │   ├── DPTrendAnalysis.js
│   │   └── BacktrackingCourse.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── app.js                  # Express middleware & route mounts
│   └── server.js               # Entry point
├── database/
│   ├── schema.sql              # MySQL DDL script
│   └── seed.sql                # Sample seed dataset
├── test/
│   └── test-runner.js          # Automated verification test suite
├── package.json
├── .env.example
├── .env
├── README.md
└── PROJECT_REPORT.md           # Formal academic submission report
```

---

## 🚀 Installation & Setup

### Prerequisites
1. **Node.js**: v18.x or higher (`node -v`)
2. **npm**: v9.x or higher (`npm -v`)
3. **MySQL Server**: MySQL 8.0 installed and running (default port `3306`)

### Step 1: Navigate to the Project Directory
```bash
cd c:\Users\divya\Desktop\DS\student-record-management-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Open or create `.env` in the root folder:
```ini
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_management_db

JWT_SECRET=super_secret_mca_dsa_jwt_key_2026
```

> **Note**: The application automatically creates the database and initializes all tables and seed records on first launch. If MySQL password is not configured, it seamlessly launches in in-memory fallback mode so everything can be tested immediately!

### Step 4: Run the Server
```bash
npm start
```

Open your browser at:
```
http://localhost:5000
```

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`
*(A convenient "Auto Fill" button is also present on the login screen for quick demoing)*

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/login` - Authenticate admin (`username`, `password`)
- `GET /api/auth/verify` - Verify current session token

### Students Module
- `GET /api/students` - Retrieve all students (Supports query params: `search`, `course`, `semester`, `sortBy`, `sortOrder`)
- `GET /api/students/:id` - Fetch comprehensive details for single student
- `POST /api/students` - Create new student profile (Pushes to Undo Stack)
- `PUT /api/students/:id` - Update student profile (Pushes prior state to Undo Stack)
- `DELETE /api/students/:id` - Delete student (Pushes prior state to Undo Stack)
- `POST /api/students/undo` - Pop and rollback last student modification

### Attendance Module
- `GET /api/attendance` - Fetch all attendance records
- `GET /api/attendance/:id` - Fetch single record
- `POST /api/attendance` - Record attendance (`student_id`, `total_classes`, `attended_classes`)
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete record

### Marks Module
- `GET /api/marks` - Fetch all marks
- `GET /api/marks/:id` - Fetch single record
- `GET /api/marks/student/:studentId` - Fetch all marks for student
- `POST /api/marks` - Record subject marks (`student_id`, `subject_name`, `internal_marks`, `external_marks`)
- `PUT /api/marks/:id` - Update marks record
- `DELETE /api/marks/:id` - Delete record

### Reports Module
- `GET /api/reports/students` - Aggregated student records & department summary
- `GET /api/reports/attendance` - Attendance overview, defaulters, high attendance
- `GET /api/reports/marks` - Grade distribution & subject averages
- `GET /api/reports/top-performers` - Dean's merit honor roll ranked by score
- `GET /api/reports/scholarship` - Greedy scholarship allocation results

### Algorithms Visualizer Module
- `GET /api/algorithms/linked-list` - Get Linked List traversal nodes
- `POST /api/algorithms/linked-list/insert` - Insert node at head or tail
- `DELETE /api/algorithms/linked-list/:studentId` - Unlink node by ID
- `GET /api/algorithms/stack` - Inspect undo stack frames
- `POST /api/algorithms/stack/pop` - Pop stack frame
- `GET /api/algorithms/queue` - Inspect registration FIFO queue
- `POST /api/algorithms/queue/enqueue` - Enqueue applicant
- `POST /api/algorithms/queue/dequeue` - Process applicant
- `GET /api/algorithms/bst` - Get serialized BST hierarchy & Inorder traversal
- `GET /api/algorithms/bst/search/:studentId` - Search BST by key
- `GET /api/algorithms/graph` - Run BFS and DFS on University hierarchy
- `POST /api/algorithms/search/linear` - Execute Linear Search by student name
- `POST /api/algorithms/search/binary` - Execute Binary Search by student ID
- `GET /api/algorithms/sort/bubble` - Execute Adaptive Bubble Sort with swap logs
- `POST /api/algorithms/greedy/scholarship` - Execute Greedy Scholarship selection
- `GET /api/algorithms/dp/trend` - Execute Dynamic Programming LIS trend analysis
- `POST /api/algorithms/backtracking/courses` - Execute Backtracking course validation

---

## 🧪 Verification & Testing

An automated verification test runner is included to test all algorithmic modules:

```bash
npm test
```

### Test Results:
```
----------------------------------------------------
Running DSA Mini Project Verification Suite...
----------------------------------------------------
  [PASS] 1. Linked List - Insert Head, Tail, Traverse & Delete
  [PASS] 2. Stack - Push, Pop, Peek & LIFO Invariant
  [PASS] 3. Queue - Enqueue, Dequeue & FIFO Invariant
  [PASS] 4. BST - Insert, Search, Inorder (Sorted ID) & Delete
  [PASS] 5. Academic Graph - Hierarchy BFS & DFS Traversal
  [PASS] 6. Searching - Linear Search (Name) & Binary Search (ID)
  [PASS] 7. Sorting - Bubble Sort for Marks & Names
  [PASS] 8. Greedy Algorithm - Scholarship Selection (Attendance >85% & Marks >80%)
  [PASS] 9. Dynamic Programming - Longest Non-Decreasing Performance Streak
  [PASS] 10. Backtracking - Prerequisite & Credit Constraint Validation
----------------------------------------------------
Results: 10 Passed, 0 Failed
All DSA verification tests passed successfully!
```

---

## 📄 Academic Project Report

A formal project report complete with Abstract, System Requirements Specification (SRS), Entity-Relationship (ER) diagram, Normalization details, Complexity proofs, and Test cases is provided in:
- [`PROJECT_REPORT.md`](PROJECT_REPORT.md)

---

## 👥 Authors & Academic Credits
- **Project**: Student Record Management System (SRMS)
- **Course**: Master of Computer Applications (MCA) / B.Tech Computer Science
- **Subject**: Data Structures and Algorithmic Techniques Mini Project

