-- ====================================================================
-- Student Record Management System
-- Database Schema Script: MySQL 8.0+
-- Database Name: student_management_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS student_management_db;
USE student_management_db;

-- Drop tables in reverse order of foreign key dependency if re-running
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- --------------------------------------------------------------------
-- Table: users (Authentication & Admin Access)
-- --------------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table: students (Primary Student Demographic & Academic Info)
-- --------------------------------------------------------------------
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_semester (course, semester),
    INDEX idx_student_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table: attendance (Attendance Tracking per Student)
-- --------------------------------------------------------------------
CREATE TABLE attendance (
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

-- --------------------------------------------------------------------
-- Table: marks (Academic Subject Evaluation)
-- --------------------------------------------------------------------
CREATE TABLE marks (
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

