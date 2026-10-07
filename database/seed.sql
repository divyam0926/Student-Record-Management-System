-- ====================================================================
-- Student Record Management System
-- Database Seed Data Script
-- ====================================================================

USE student_management_db;

-- Insert Admin User (Password: admin123)
-- bcrypt hash for 'admin123': $2a$10$V04qY9Z5p07Ff94bS6k2pOUr/z35R3xU5h/p2c4H0v3GgP3r0.1C2
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$V04qY9Z5p07Ff94bS6k2pOUr/z35R3xU5h/p2c4H0v3GgP3r0.1C2', 'admin'),
('faculty', '$2a$10$V04qY9Z5p07Ff94bS6k2pOUr/z35R3xU5h/p2c4H0v3GgP3r0.1C2', 'faculty')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Students
INSERT INTO students (student_id, name, gender, dob, email, phone, address, course, semester) VALUES
('STU-1001', 'Aarav Sharma', 'Male', '2001-05-14', 'aarav.sharma@kristujayanti.com', '9876543210', '124 Park Avenue, South Extension, New Delhi', 'MCA', 3),
('STU-1002', 'Diya Patel', 'Female', '2002-08-22', 'diya.patel@kristujayanti.com', '9876543211', '45 Green Meadows, Vastrapur, Ahmedabad', 'MCA', 3),
('STU-1003', 'Rohan Verma', 'Male', '2001-11-03', 'rohan.verma@kristujayanti.com', '9876543212', '78 Lake View Enclave, Whitefield, Bengaluru', 'Data Science', 2),
('STU-1004', 'Ananya Iyer', 'Female', '2002-03-19', 'ananya.iyer@kristujayanti.com', '9876543213', '12 Temple Bells Street, Mylapore, Chennai', 'AI & ML', 4),
('STU-1005', 'Vikram Malhotra', 'Male', '2000-12-30', 'vikram.m@kristujayanti.com', '9876543214', '89 Hill Road, Bandra West, Mumbai', 'MCA', 3),
('STU-1006', 'Sneha Kulkarni', 'Female', '2002-07-11', 'sneha.k@kristujayanti.com', '9876543215', '34 Deccan Gymkhana, Pune', 'Data Science', 2),
('STU-1007', 'Kabir Das', 'Male', '2001-09-08', 'kabir.das@kristujayanti.com', '9876543216', '56 Salt Lake Sector 5, Kolkata', 'B.Tech CSE', 6),
('STU-1008', 'Pooja Reddy', 'Female', '2002-01-25', 'pooja.reddy@kristujayanti.com', '9876543217', '90 Jubilee Hills, Hyderabad', 'AI & ML', 4),
('STU-1009', 'Aditya Nair', 'Male', '2001-04-17', 'aditya.nair@kristujayanti.com', '9876543218', '23 Marine Drive, Kochi', 'MCA', 3),
('STU-1010', 'Meera Joshi', 'Female', '2002-10-05', 'meera.joshi@kristujayanti.com', '9876543219', '67 Civil Lines, Jaipur', 'B.Tech CSE', 6),
('STU-1011', 'Arjun Sengupta', 'Male', '2001-06-28', 'arjun.s@kristujayanti.com', '9876543220', '10 Ballygunge Circular Rd, Kolkata', 'Data Science', 2),
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email);

-- Insert Attendance Records
-- Grade & scholarship rules: Attendance > 85% qualifies for Scholarship consideration
INSERT INTO attendance (student_id, total_classes, attended_classes) VALUES
('STU-1001', 60, 56), -- 93.33% (Scholarship candidate)
('STU-1002', 60, 54), -- 90.00% (Scholarship candidate)
('STU-1003', 55, 48), -- 87.27% (Scholarship candidate)
('STU-1004', 65, 62), -- 95.38% (Scholarship candidate)
('STU-1005', 60, 42), -- 70.00% (Defaulter < 75%)
('STU-1006', 55, 49), -- 89.09% (Scholarship candidate)
('STU-1007', 70, 52), -- 74.29% (Defaulter < 75%)
('STU-1008', 65, 59), -- 90.77% (Scholarship candidate)
('STU-1009', 60, 47), -- 78.33% (Normal)
('STU-1010', 70, 65), -- 92.86% (Scholarship candidate)
('STU-1011', 55, 38), -- 69.09% (Defaulter < 75%)
('STU-1012', 65, 58)  -- 89.23% (Scholarship candidate)
ON DUPLICATE KEY UPDATE attended_classes=VALUES(attended_classes);

-- Insert Marks Records
-- Grade calculation rules:
-- 90+ = A+, 80+ = A, 70+ = B+, 60+ = B, 50+ = C, Below 50 = F
INSERT INTO marks (student_id, subject_name, internal_marks, external_marks, grade) VALUES
('STU-1001', 'Data Structures & Algorithms', 28.00, 66.00, 'A+'), -- Total: 94.00
('STU-1001', 'Database Management Systems', 27.00, 64.00, 'A+'), -- Total: 91.00
('STU-1002', 'Data Structures & Algorithms', 26.00, 63.00, 'A'),  -- Total: 89.00
('STU-1002', 'Database Management Systems', 25.00, 61.00, 'A'),  -- Total: 86.00
('STU-1003', 'Machine Learning Foundations', 25.00, 58.00, 'A'),  -- Total: 83.00
('STU-1003', 'Big Data Analytics', 24.00, 59.00, 'A'),          -- Total: 83.00
('STU-1004', 'Deep Learning & Neural Networks', 29.00, 67.00, 'A+'), -- Total: 96.00
('STU-1004', 'Computer Vision', 28.00, 65.00, 'A+'),             -- Total: 93.00
('STU-1005', 'Data Structures & Algorithms', 18.00, 44.00, 'B'),  -- Total: 62.00
('STU-1005', 'Database Management Systems', 19.00, 48.00, 'B+'), -- Total: 67.00
('STU-1006', 'Machine Learning Foundations', 27.00, 61.00, 'A'),  -- Total: 88.00
('STU-1006', 'Big Data Analytics', 26.00, 60.00, 'A'),          -- Total: 86.00
('STU-1007', 'Operating Systems', 15.00, 31.00, 'F'),            -- Total: 46.00
('STU-1007', 'Computer Networks', 17.00, 39.00, 'C'),            -- Total: 56.00
('STU-1008', 'Deep Learning & Neural Networks', 27.00, 64.00, 'A+'), -- Total: 91.00
('STU-1008', 'Natural Language Processing', 28.00, 63.00, 'A+'),    -- Total: 91.00
('STU-1009', 'Data Structures & Algorithms', 22.00, 53.00, 'B+'), -- Total: 75.00
('STU-1009', 'Web Technologies', 23.00, 55.00, 'B+'),            -- Total: 78.00
('STU-1010', 'Operating Systems', 26.00, 62.00, 'A'),            -- Total: 88.00
('STU-1010', 'Computer Networks', 27.00, 63.00, 'A'),            -- Total: 90.00
('STU-1011', 'Big Data Analytics', 16.00, 31.00, 'F'),            -- Total: 47.00
('STU-1012', 'Computer Vision', 26.00, 59.00, 'A')              -- Total: 85.00
ON DUPLICATE KEY UPDATE grade=VALUES(grade);

