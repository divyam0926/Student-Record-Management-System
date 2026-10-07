/**
 * Student Record Management System
 * Database Configuration & Connection Pool
 * Dual-Mode: MySQL 8.0 with graceful in-memory fallback
 */

const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let isUsingMySQL = false;

// In-memory fallback data store in case MySQL credentials are not configured
const inMemoryStore = {
    users: [{
            user_id: 1,
            username: 'admin',
            password: '$2a$10$V04qY9Z5p07Ff94bS6k2pOUr/z35R3xU5h/p2c4H0v3GgP3r0.1C2', // admin123
            role: 'admin',
            created_at: new Date()
        },
        {
            user_id: 2,
            username: 'faculty',
            password: '$2a$10$V04qY9Z5p07Ff94bS6k2pOUr/z35R3xU5h/p2c4H0v3GgP3r0.1C2',
            role: 'faculty',
            created_at: new Date()
        }
    ],
    students: [{
            student_id: 'STU-1001',
            name: 'Aarav Sharma',
            gender: 'Male',
            dob: '2001-05-14',
            email: 'aarav.sharma@kristujayanti.com',
            phone: '9876543210',
            address: '124 Park Avenue, South Extension, New Delhi',
            course: 'MCA',
            semester: 3,
            created_at: new Date('2024-01-10')
        },
        {
            student_id: 'STU-1002',
            name: 'Diya Patel',
            gender: 'Female',
            dob: '2002-08-22',
            email: 'diya.patel@kristujayanti.com',
            phone: '9876543211',
            address: '45 Green Meadows, Vastrapur, Ahmedabad',
            course: 'MCA',
            semester: 3,
            created_at: new Date('2024-01-11')
        },
        {
            student_id: 'STU-1003',
            name: 'Rohan Verma',
            gender: 'Male',
            dob: '2001-11-03',
            email: 'rohan.verma@kristujayanti.com',
            phone: '9876543212',
            address: '78 Lake View Enclave, Whitefield, Bengaluru',
            course: 'Data Science',
            semester: 2,
            created_at: new Date('2024-01-12')
        },
        {
            student_id: 'STU-1004',
            name: 'Ananya Iyer',
            gender: 'Female',
            dob: '2002-03-19',
            email: 'ananya.iyer@kristujayanti.com',
            phone: '9876543213',
            address: '12 Temple Bells Street, Mylapore, Chennai',
            course: 'AI & ML',
            semester: 4,
            created_at: new Date('2024-01-13')
        },
        {
            student_id: 'STU-1005',
            name: 'Vikram Malhotra',
            gender: 'Male',
            dob: '2000-12-30',
            email: 'vikram.m@kristujayanti.com',
            phone: '9876543214',
            address: '89 Hill Road, Bandra West, Mumbai',
            course: 'MCA',
            semester: 3,
            created_at: new Date('2024-01-14')
        },
        {
            student_id: 'STU-1006',
            name: 'Sneha Kulkarni',
            gender: 'Female',
            dob: '2002-07-11',
            email: 'sneha.k@kristujayanti.com',
            phone: '9876543215',
            address: '34 Deccan Gymkhana, Pune',
            course: 'Data Science',
            semester: 2,
            created_at: new Date('2024-01-15')
        },
        {
            student_id: 'STU-1007',
            name: 'Kabir Das',
            gender: 'Male',
            dob: '2001-09-08',
            email: 'kabir.das@kristujayanti.com',
            phone: '9876543216',
            address: '56 Salt Lake Sector 5, Kolkata',
            course: 'B.Tech CSE',
            semester: 6,
            created_at: new Date('2024-01-16')
        },
        {
            student_id: 'STU-1008',
            name: 'Pooja Reddy',
            gender: 'Female',
            dob: '2002-01-25',
            email: 'pooja.reddy@kristujayanti.com',
            phone: '9876543217',
            address: '90 Jubilee Hills, Hyderabad',
            course: 'AI & ML',
            semester: 4,
            created_at: new Date('2024-01-17')
        },
        {
            student_id: 'STU-1009',
            name: 'Aditya Nair',
            gender: 'Male',
            dob: '2001-04-17',
            email: 'aditya.nair@kristujayanti.com',
            phone: '9876543218',
            address: '23 Marine Drive, Kochi',
            course: 'MCA',
            semester: 3,
            created_at: new Date('2024-01-18')
        },
        {
            student_id: 'STU-1010',
            name: 'Meera Joshi',
            gender: 'Female',
            dob: '2002-10-05',
            email: 'meera.joshi@kristujayanti.com',
            phone: '9876543219',
            address: '67 Civil Lines, Jaipur',
            course: 'B.Tech CSE',
            semester: 6,
            created_at: new Date('2024-01-19')
        },
        {
            student_id: 'STU-1011',
            name: 'Arjun Sengupta',
            gender: 'Male',
            dob: '2001-06-28',
            email: 'arjun.s@kristujayanti.com',
            phone: '9876543220',
            address: '10 Ballygunge Circular Rd, Kolkata',
            course: 'Data Science',
            semester: 2,
            created_at: new Date('2024-01-20')
        },
        {
            student_id: 'STU-1012',
            name: 'Tanvi Deshmukh',
            gender: 'Female',
            dob: '2002-02-14',
            email: 'tanvi.d@kristujayanti.com',
            phone: '9876543221',
            address: '81 Shivaji Nagar, Nagpur',
            course: 'AI & ML',
            semester: 4,
            created_at: new Date('2024-01-21')
        }
    ],
    attendance: [
        { attendance_id: 1, student_id: 'STU-1001', total_classes: 60, attended_classes: 56, attendance_percentage: 93.33 },
        { attendance_id: 2, student_id: 'STU-1002', total_classes: 60, attended_classes: 54, attendance_percentage: 90.00 },
        { attendance_id: 3, student_id: 'STU-1003', total_classes: 55, attended_classes: 48, attendance_percentage: 87.27 },
        { attendance_id: 4, student_id: 'STU-1004', total_classes: 65, attended_classes: 62, attendance_percentage: 95.38 },
        { attendance_id: 5, student_id: 'STU-1005', total_classes: 60, attended_classes: 42, attendance_percentage: 70.00 },
        { attendance_id: 6, student_id: 'STU-1006', total_classes: 55, attended_classes: 49, attendance_percentage: 89.09 },
        { attendance_id: 7, student_id: 'STU-1007', total_classes: 70, attended_classes: 52, attendance_percentage: 74.29 },
        { attendance_id: 8, student_id: 'STU-1008', total_classes: 65, attended_classes: 59, attendance_percentage: 90.77 },
        { attendance_id: 9, student_id: 'STU-1009', total_classes: 60, attended_classes: 47, attendance_percentage: 78.33 },
        { attendance_id: 10, student_id: 'STU-1010', total_classes: 70, attended_classes: 65, attendance_percentage: 92.86 },
        { attendance_id: 11, student_id: 'STU-1011', total_classes: 55, attended_classes: 38, attendance_percentage: 69.09 },
        { attendance_id: 12, student_id: 'STU-1012', total_classes: 65, attended_classes: 58, attendance_percentage: 89.23 }
    ],
    marks: [
        { mark_id: 1, student_id: 'STU-1001', subject_name: 'Data Structures & Algorithms', internal_marks: 28, external_marks: 66, total_marks: 94, grade: 'A+' },
        { mark_id: 2, student_id: 'STU-1001', subject_name: 'Database Management Systems', internal_marks: 27, external_marks: 64, total_marks: 91, grade: 'A+' },
        { mark_id: 3, student_id: 'STU-1002', subject_name: 'Data Structures & Algorithms', internal_marks: 26, external_marks: 63, total_marks: 89, grade: 'A' },
        { mark_id: 4, student_id: 'STU-1002', subject_name: 'Database Management Systems', internal_marks: 25, external_marks: 61, total_marks: 86, grade: 'A' },
        { mark_id: 5, student_id: 'STU-1003', subject_name: 'Machine Learning Foundations', internal_marks: 25, external_marks: 58, total_marks: 83, grade: 'A' },
        { mark_id: 6, student_id: 'STU-1003', subject_name: 'Big Data Analytics', internal_marks: 24, external_marks: 59, total_marks: 83, grade: 'A' },
        { mark_id: 7, student_id: 'STU-1004', subject_name: 'Deep Learning & Neural Networks', internal_marks: 29, external_marks: 67, total_marks: 96, grade: 'A+' },
        { mark_id: 8, student_id: 'STU-1004', subject_name: 'Computer Vision', internal_marks: 28, external_marks: 65, total_marks: 93, grade: 'A+' },
        { mark_id: 9, student_id: 'STU-1005', subject_name: 'Data Structures & Algorithms', internal_marks: 18, external_marks: 44, total_marks: 62, grade: 'B' },
        { mark_id: 10, student_id: 'STU-1005', subject_name: 'Database Management Systems', internal_marks: 19, external_marks: 48, total_marks: 67, grade: 'B+' },
        { mark_id: 11, student_id: 'STU-1006', subject_name: 'Machine Learning Foundations', internal_marks: 27, external_marks: 61, total_marks: 88, grade: 'A' },
        { mark_id: 12, student_id: 'STU-1006', subject_name: 'Big Data Analytics', internal_marks: 26, external_marks: 60, total_marks: 86, grade: 'A' },
        { mark_id: 13, student_id: 'STU-1007', subject_name: 'Operating Systems', internal_marks: 15, external_marks: 31, total_marks: 46, grade: 'F' },
        { mark_id: 14, student_id: 'STU-1007', subject_name: 'Computer Networks', internal_marks: 17, external_marks: 39, total_marks: 56, grade: 'C' },
        { mark_id: 15, student_id: 'STU-1008', subject_name: 'Deep Learning & Neural Networks', internal_marks: 27, external_marks: 64, total_marks: 91, grade: 'A+' },
        { mark_id: 16, student_id: 'STU-1008', subject_name: 'Natural Language Processing', internal_marks: 28, external_marks: 63, total_marks: 91, grade: 'A+' },
        { mark_id: 17, student_id: 'STU-1009', subject_name: 'Data Structures & Algorithms', internal_marks: 22, external_marks: 53, total_marks: 75, grade: 'B+' },
        { mark_id: 18, student_id: 'STU-1009', subject_name: 'Web Technologies', internal_marks: 23, external_marks: 55, total_marks: 78, grade: 'B+' },
        { mark_id: 19, student_id: 'STU-1010', subject_name: 'Operating Systems', internal_marks: 26, external_marks: 62, total_marks: 88, grade: 'A' },
        { mark_id: 20, student_id: 'STU-1010', subject_name: 'Computer Networks', internal_marks: 27, external_marks: 63, total_marks: 90, grade: 'A' },
        { mark_id: 21, student_id: 'STU-1011', subject_name: 'Big Data Analytics', internal_marks: 16, external_marks: 31, total_marks: 47, grade: 'F' },
        { mark_id: 22, student_id: 'STU-1012', subject_name: 'Computer Vision', internal_marks: 26, external_marks: 59, total_marks: 85, grade: 'A' }
    ]
};

let autoIncrementCounters = {
    users: 3,
    attendance: 13,
    marks: 23
};

/**
 * Initialize database connection and auto-create schema if needed
 */
async function initDatabase() {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'student_management_db';

    try {
        // Step 1: Connect to MySQL server without DB selected to ensure DB exists
        const adminConn = await mysql.createConnection({
            host,
            port,
            user,
            password
        });

        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await adminConn.end();

        // Step 2: Create connection pool with selected DB
        pool = mysql.createPool({
            host,
            port,
            user,
            password,
            database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Step 3: Run table migrations
        await createTables();
        await seedInitialData();

        isUsingMySQL = true;
        console.log(`[DB] Successfully connected to MySQL server (${host}:${port}/${database}).`);
    } catch (error) {
        isUsingMySQL = false;
        console.warn(`[DB WARNING] Could not connect to MySQL server: ${error.message}`);
        console.warn(`[DB FALLBACK] Running in in-memory repository mode with seeded test data.`);
        console.warn(`[DB TIP] Configure your MySQL password in '.env' and restart to use MySQL.`);
    }
}

/**
 * Create tables if they do not exist
 */
async function createTables() {
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

    const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      student_id VARCHAR(20) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      gender ENUM('Male', 'Female', 'Other') NOT NULL,
      dob DATE NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      course VARCHAR(50) NOT NULL,
      semester INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_course_semester (course, semester),
      INDEX idx_student_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

    const createAttendanceTable = `
    CREATE TABLE IF NOT EXISTS attendance (
      attendance_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) NOT NULL,
      total_classes INT NOT NULL DEFAULT 0,
      attended_classes INT NOT NULL DEFAULT 0,
      attendance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
          WHEN total_classes > 0 THEN ROUND((attended_classes / total_classes) * 100, 2)
          ELSE 0.00 
        END
      ) STORED,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
      INDEX idx_attendance_percentage (attendance_percentage)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

    const createMarksTable = `
    CREATE TABLE IF NOT EXISTS marks (
      mark_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      internal_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      external_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      total_marks DECIMAL(5,2) GENERATED ALWAYS AS (internal_marks + external_marks) STORED,
      grade VARCHAR(5) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_marks_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
      INDEX idx_student_subject (student_id, subject_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

    await pool.query(createUsersTable);
    await pool.query(createStudentsTable);
    await pool.query(createAttendanceTable);
    await pool.query(createMarksTable);
}

/**
 * Seed initial sample records into MySQL if tables are empty
 */
async function seedInitialData() {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
        for (const u of inMemoryStore.users) {
            await pool.query(
                'INSERT INTO users (user_id, username, password, role) VALUES (?, ?, ?, ?)', [u.user_id, u.username, u.password, u.role]
            );
        }
    }

    const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
    if (students[0].count === 0) {
        for (const s of inMemoryStore.students) {
            await pool.query(
                'INSERT INTO students (student_id, name, gender, dob, email, phone, address, course, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [s.student_id, s.name, s.gender, s.dob, s.email, s.phone, s.address, s.course, s.semester]
            );
        }

        for (const a of inMemoryStore.attendance) {
            await pool.query(
                'INSERT INTO attendance (student_id, total_classes, attended_classes) VALUES (?, ?, ?)', [a.student_id, a.total_classes, a.attended_classes]
            );
        }

        for (const m of inMemoryStore.marks) {
            await pool.query(
                'INSERT INTO marks (student_id, subject_name, internal_marks, external_marks, grade) VALUES (?, ?, ?, ?, ?)', [m.student_id, m.subject_name, m.internal_marks, m.external_marks, m.grade]
            );
        }
    }
}

module.exports = {
    initDatabase,
    getPool: () => pool,
    getIsUsingMySQL: () => isUsingMySQL,
    inMemoryStore,
    autoIncrementCounters
};