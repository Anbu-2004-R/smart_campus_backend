-- Smart Campus ERP demo seed data.
-- Idempotent: every insert uses INSERT IGNORE with stable IDs.
-- Demo passwords: admin123, faculty123, student123 (PBKDF2-SHA256).

INSERT IGNORE INTO users (id, login_id, email, password_hash, role, status, created_at, last_login, avatar_url) VALUES
('usr-admin-1', 'admin', 'registrar@smartcampus.edu', 'pbkdf2$120000$d2WAHNgXTq5aUqhTSmKfCQ==$bYB4+F0atOysZB1Fe6j8mjXZShLX7a5NSCFyH8fR2Qw=', 'ADMIN', 'ACTIVE', '2024-01-15 08:00:00', '2026-10-19 08:30:00', NULL),
('usr-fac-1', 'prof.rajesh', 'rajesh.raman@smartcampus.edu', 'pbkdf2$120000$FCKdEUm/buWRrCL3E2ncug==$gCavjtU/4jzmKjrz9TQkaELOzVbjES7ukLAENYm/YXE=', 'FACULTY', 'ACTIVE', '2024-01-20 09:00:00', '2026-10-19 07:45:00', '/src/assets/images/avatar_faculty_prof_1792424389100.jpg'),
('usr-fac-2', 'prof.priya', 'priya.nair@smartcampus.edu', 'pbkdf2$120000$FCKdEUm/buWRrCL3E2ncug==$gCavjtU/4jzmKjrz9TQkaELOzVbjES7ukLAENYm/YXE=', 'FACULTY', 'ACTIVE', '2024-02-01 10:00:00', '2026-10-18 16:20:00', NULL),
('usr-fac-3', 'prof.vikram', 'vikram.mehta@smartcampus.edu', 'pbkdf2$120000$FCKdEUm/buWRrCL3E2ncug==$gCavjtU/4jzmKjrz9TQkaELOzVbjES7ukLAENYm/YXE=', 'FACULTY', 'ACTIVE', '2024-02-05 10:00:00', '2026-10-17 11:10:00', NULL),
('usr-stu-1', '21cs101', 'ananya.s@smartcampus.edu', 'pbkdf2$120000$3GAV3bLykvgJR423tLcQkA==$lBTaekpffu+EHmDz5Z6pyyyQ2TlENemJoB9VC7aB+6A=', 'STUDENT', 'ACTIVE', '2024-08-01 09:00:00', '2026-10-19 08:15:00', '/src/assets/images/avatar_student_lead_1792424389571.jpg'),
('usr-stu-2', '21cs102', 'rohan.v@smartcampus.edu', 'pbkdf2$120000$3GAV3bLykvgJR423tLcQkA==$lBTaekpffu+EHmDz5Z6pyyyQ2TlENemJoB9VC7aB+6A=', 'STUDENT', 'ACTIVE', '2024-08-01 09:00:00', '2026-10-18 14:30:00', NULL),
('usr-stu-3', '21cs103', 'karthik.r@smartcampus.edu', 'pbkdf2$120000$3GAV3bLykvgJR423tLcQkA==$lBTaekpffu+EHmDz5Z6pyyyQ2TlENemJoB9VC7aB+6A=', 'STUDENT', 'ACTIVE', '2024-08-01 09:00:00', '2026-10-16 18:00:00', NULL),
('usr-stu-4', '21cs104', 'meera.k@smartcampus.edu', 'pbkdf2$120000$3GAV3bLykvgJR423tLcQkA==$lBTaekpffu+EHmDz5Z6pyyyQ2TlENemJoB9VC7aB+6A=', 'STUDENT', 'ACTIVE', '2024-08-01 09:00:00', '2026-10-15 09:10:00', NULL),
('usr-stu-5', '21cs105', 'arjun.d@smartcampus.edu', 'pbkdf2$120000$3GAV3bLykvgJR423tLcQkA==$lBTaekpffu+EHmDz5Z6pyyyQ2TlENemJoB9VC7aB+6A=', 'STUDENT', 'INACTIVE', '2024-08-01 09:00:00', NULL, NULL);

INSERT IGNORE INTO departments (id, code, name, hod_name, faculty_count, student_count) VALUES
('dept-cse', 'CSE', 'Computer Science & Engineering', 'Dr. Rajesh Raman', 24, 480),
('dept-ece', 'ECE', 'Electronics & Communication Engineering', 'Dr. Vikram Mehta', 20, 420),
('dept-mech', 'MECH', 'Mechanical Engineering', 'Dr. S. K. Mukherjee', 18, 360),
('dept-civil', 'CIVIL', 'Civil Engineering', 'Dr. R. Vasudevan', 16, 310);

INSERT IGNORE INTO courses (id, code, name, department_id, total_semesters, degree_type) VALUES
('crs-btech-cse', 'BT-CSE', 'B.Tech in Computer Science & Engineering', 'dept-cse', 8, 'B.Tech'),
('crs-btech-ece', 'BT-ECE', 'B.Tech in Electronics & Communication Engineering', 'dept-ece', 8, 'B.Tech');

INSERT IGNORE INTO class_groups (id, name, course_id, semester, section, academic_year, total_students) VALUES
('cg-cse-5a', 'B.Tech Computer Science & Engineering - Semester 5 - Section A', 'crs-btech-cse', 5, 'A', '2026-2027', 64),
('cg-cse-5b', 'B.Tech Computer Science & Engineering - Semester 5 - Section B', 'crs-btech-cse', 5, 'B', '2026-2027', 62),
('cg-ece-5a', 'B.Tech Electronics & Communication Engineering - Semester 5 - Section A', 'crs-btech-ece', 5, 'A', '2026-2027', 58),
('cg-cse-4a', 'CSE - Semester 4 (Sec A)', 'crs-btech-cse', 4, 'A', '2024-2025', 62),
('cg-cse-3a', 'CSE - Semester 3 (Sec A)', 'crs-btech-cse', 3, 'A', '2024-2025', 64);

INSERT IGNORE INTO subjects (id, code, name, course_id, semester, credits, max_marks, pass_marks, type) VALUES
('sub-cs501', 'CS501', 'Operating Systems', 'crs-btech-cse', 5, 4.0, 100, 45, 'THEORY'),
('sub-cs502', 'CS502', 'Database Management Systems', 'crs-btech-cse', 5, 4.0, 100, 45, 'THEORY'),
('sub-cs503', 'CS503', 'Computer Networks', 'crs-btech-cse', 5, 3.0, 100, 45, 'THEORY'),
('sub-cs504', 'CS504', 'Design & Analysis of Algorithms', 'crs-btech-cse', 5, 4.0, 100, 45, 'THEORY'),
('sub-cs505', 'CS505', 'Operating Systems Laboratory', 'crs-btech-cse', 5, 2.0, 50, 25, 'PRACTICAL'),
('sub-cs401', 'CS401', 'Theory of Computation', 'crs-btech-cse', 4, 4.0, 100, 45, 'THEORY'),
('sub-cs402', 'CS402', 'Microprocessors & Microcontrollers', 'crs-btech-cse', 4, 3.0, 100, 45, 'THEORY'),
('sub-cs403', 'CS403', 'Software Engineering', 'crs-btech-cse', 4, 3.0, 100, 45, 'THEORY'),
('sub-cs404', 'CS404', 'Probability & Queueing Theory', 'crs-btech-cse', 4, 4.0, 100, 45, 'THEORY'),
('sub-cs301', 'CS301', 'Discrete Mathematics', 'crs-btech-cse', 3, 4.0, 100, 45, 'THEORY');

INSERT IGNORE INTO faculty_profiles (id, user_id, employee_id, full_name, department_id, email, phone, designation, avatar_url) VALUES
('fac-1', 'usr-fac-1', 'EMP-CSE-001', 'Dr. Rajesh Raman', 'dept-cse', 'rajesh.raman@smartcampus.edu', '+91 98401 23456', 'Professor & Head of Department', '/src/assets/images/avatar_faculty_prof_1792424389100.jpg'),
('fac-2', 'usr-fac-2', 'EMP-CSE-014', 'Prof. Priya Nair', 'dept-cse', 'priya.nair@smartcampus.edu', '+91 98402 34567', 'Associate Professor', NULL),
('fac-3', 'usr-fac-3', 'EMP-ECE-003', 'Dr. Vikram Mehta', 'dept-ece', 'vikram.mehta@smartcampus.edu', '+91 98403 45678', 'Professor & HOD ECE', NULL);

INSERT IGNORE INTO student_profiles (id, user_id, register_number, full_name, department_id, course_id, current_semester, academic_year, email, phone, date_of_birth, avatar_url, class_group_id) VALUES
('stu-1', 'usr-stu-1', '21CS101', 'Ananya Sharma', 'dept-cse', 'crs-btech-cse', 5, '2026-2027', 'ananya.s@smartcampus.edu', '+91 97890 12345', '2004-05-14', '/src/assets/images/avatar_student_lead_1792424389571.jpg', 'cg-cse-5a'),
('stu-2', 'usr-stu-2', '21CS102', 'Rohan Varma', 'dept-cse', 'crs-btech-cse', 5, '2026-2027', 'rohan.v@smartcampus.edu', '+91 97890 23456', '2004-08-22', NULL, 'cg-cse-5a'),
('stu-3', 'usr-stu-3', '21CS103', 'Karthik Raja', 'dept-cse', 'crs-btech-cse', 5, '2026-2027', 'karthik.r@smartcampus.edu', '+91 97890 34567', '2003-12-05', NULL, 'cg-cse-5a'),
('stu-4', 'usr-stu-4', '21CS104', 'Meera Krishnan', 'dept-cse', 'crs-btech-cse', 5, '2026-2027', 'meera.k@smartcampus.edu', '+91 97890 45678', '2004-03-30', NULL, 'cg-cse-5a'),
('stu-5', 'usr-stu-5', '21CS105', 'Arjun Das', 'dept-cse', 'crs-btech-cse', 5, '2026-2027', 'arjun.d@smartcampus.edu', '+91 97890 56789', '2003-11-18', NULL, 'cg-cse-5a');

INSERT IGNORE INTO faculty_subject_assignments (id, faculty_id, subject_id, class_group_id, academic_year, semester) VALUES
('fa-1', 'fac-1', 'sub-cs501', 'cg-cse-5a', '2026-2027', 5),
('fa-2', 'fac-1', 'sub-cs505', 'cg-cse-5a', '2026-2027', 5),
('fa-3', 'fac-2', 'sub-cs502', 'cg-cse-5a', '2026-2027', 5),
('fa-4', 'fac-2', 'sub-cs503', 'cg-cse-5a', '2026-2027', 5),
('fa-5', 'fac-1', 'sub-cs504', 'cg-cse-5a', '2026-2027', 5);

INSERT IGNORE INTO classrooms (id, room_number, building, floor, capacity, type) VALUES
('room-101', 'LH-101', 'Academic Block A', 1, 70, 'LECTURE_HALL'),
('room-102', 'LH-102', 'Academic Block A', 1, 70, 'LECTURE_HALL'),
('room-lab-2', 'CS-LAB-2', 'Turing Computing Center', 2, 60, 'LAB'),
('room-sem-1', 'SEM-201', 'Central Block', 2, 120, 'SEMINAR_ROOM');

INSERT IGNORE INTO timetable_entries (id, day_of_week, period, start_time, end_time, class_group_id, subject_id, faculty_id, classroom_id) VALUES
('tt-1', 'MONDAY', 1, '09:00:00', '09:50:00', 'cg-cse-5a', 'sub-cs501', 'fac-1', 'room-101'),
('tt-2', 'MONDAY', 2, '09:55:00', '10:45:00', 'cg-cse-5a', 'sub-cs502', 'fac-2', 'room-101'),
('tt-3', 'MONDAY', 3, '11:00:00', '11:50:00', 'cg-cse-5a', 'sub-cs503', 'fac-2', 'room-101'),
('tt-4', 'MONDAY', 4, '11:55:00', '12:45:00', 'cg-cse-5a', 'sub-cs504', 'fac-1', 'room-101'),
('tt-5', 'TUESDAY', 1, '09:00:00', '09:50:00', 'cg-cse-5a', 'sub-cs502', 'fac-2', 'room-101'),
('tt-6', 'TUESDAY', 2, '09:55:00', '10:45:00', 'cg-cse-5a', 'sub-cs501', 'fac-1', 'room-101'),
('tt-7', 'WEDNESDAY', 3, '11:00:00', '12:45:00', 'cg-cse-5a', 'sub-cs505', 'fac-1', 'room-lab-2'),
('tt-8', 'THURSDAY', 1, '09:00:00', '09:50:00', 'cg-cse-5a', 'sub-cs501', 'fac-1', 'room-101'),
('tt-9', 'FRIDAY', 2, '09:55:00', '10:45:00', 'cg-cse-5a', 'sub-cs503', 'fac-2', 'room-101');

INSERT IGNORE INTO class_sessions (id, assignment_id, subject_id, class_group_id, faculty_id, session_date, period, room_number, topic_covered, marked_at) VALUES
('sess-1', 'fa-1', 'sub-cs501', 'cg-cse-5a', 'fac-1', '2026-10-16', 1, 'LH-101', 'Virtual Memory & Page Replacement Algorithms', '2026-10-16 09:55:00'),
('sess-2', 'fa-1', 'sub-cs501', 'cg-cse-5a', 'fac-1', '2026-10-14', 2, 'LH-101', 'Deadlock Detection & Banker Algorithm', '2026-10-14 10:50:00'),
('sess-3', 'fa-3', 'sub-cs502', 'cg-cse-5a', 'fac-2', '2026-10-15', 2, 'LH-101', 'Query Optimization & B+ Tree Indexing', '2026-10-15 10:50:00'),
('sess-4', 'fa-4', 'sub-cs503', 'cg-cse-5a', 'fac-2', '2026-10-13', 3, 'LH-101', 'TCP Congestion Control Algorithms', '2026-10-13 11:55:00'),
('sess-5', 'fa-1', 'sub-cs501', 'cg-cse-5a', 'fac-1', '2026-10-02', 1, 'LH-101', 'Semaphores & Interprocess Communication', '2026-10-02 09:55:00');

INSERT IGNORE INTO attendance_records (id, session_id, student_id, status, remarks) VALUES
('att-1-1', 'sess-1', 'stu-1', 'PRESENT', NULL),
('att-1-2', 'sess-1', 'stu-2', 'PRESENT', NULL),
('att-1-3', 'sess-1', 'stu-3', 'ABSENT', 'Uninformed absence'),
('att-1-4', 'sess-1', 'stu-4', 'ABSENT', NULL),
('att-2-1', 'sess-2', 'stu-1', 'PRESENT', NULL),
('att-2-2', 'sess-2', 'stu-2', 'PRESENT', NULL),
('att-2-3', 'sess-2', 'stu-3', 'PRESENT', NULL),
('att-2-4', 'sess-2', 'stu-4', 'ABSENT', NULL),
('att-3-1', 'sess-3', 'stu-1', 'PRESENT', NULL),
('att-3-2', 'sess-3', 'stu-2', 'LATE', 'Late entry (5 mins)'),
('att-3-3', 'sess-3', 'stu-3', 'PRESENT', NULL),
('att-3-4', 'sess-3', 'stu-4', 'ABSENT', NULL),
('att-4-1', 'sess-4', 'stu-1', 'PRESENT', NULL),
('att-4-2', 'sess-4', 'stu-2', 'PRESENT', NULL),
('att-4-3', 'sess-4', 'stu-3', 'ABSENT', NULL),
('att-4-4', 'sess-4', 'stu-4', 'ABSENT', NULL),
('att-5-1', 'sess-5', 'stu-1', 'ABSENT', 'Recorded absent'),
('att-5-2', 'sess-5', 'stu-2', 'PRESENT', NULL),
('att-5-3', 'sess-5', 'stu-3', 'PRESENT', NULL),
('att-5-4', 'sess-5', 'stu-4', 'ABSENT', NULL);

INSERT IGNORE INTO attendance_correction_requests (id, student_id, session_id, subject_id, session_date, original_status, requested_status, reason, evidence_note, status, is_eligible_for_faculty, submitted_at, reviewed_by, reviewer_role, reviewed_at, review_remarks) VALUES
('req-att-1', 'stu-1', 'sess-1', 'sub-cs501', '2026-10-16', 'ABSENT', 'ON_DUTY', 'Represented college in National Hackathon semifinals (approved OD form attached).', 'OD-CSE-2026-88 approved by Dean of Student Affairs.', 'PENDING_FACULTY', 1, '2026-10-17 11:20:00', NULL, NULL, NULL, NULL),
('req-att-2', 'stu-3', 'sess-4', 'sub-cs503', '2026-10-13', 'ABSENT', 'PRESENT', 'Biometric reader timeout at entrance, arrived at class 09:02 AM.', 'Security log entry #4412 confirmed entrance.', 'PENDING_FACULTY', 1, '2026-10-14 09:30:00', NULL, NULL, NULL, NULL),
('req-att-3', 'stu-1', 'sess-5', 'sub-cs501', '2026-10-02', 'ABSENT', 'PRESENT', 'Medical hospitalization certificate submitted to office on Oct 4th; was mistakenly marked absent.', 'Apollo Clinic Discharge Summary #MED-89102.', 'PENDING_ADMIN', 0, '2026-10-18 10:15:00', NULL, NULL, NULL, NULL),
('req-att-4', 'stu-2', 'sess-3', 'sub-cs502', '2026-10-08', 'ABSENT', 'PRESENT', 'Was present in second row; attendance sheet missed signing.', NULL, 'APPROVED', 1, '2026-10-09 08:00:00', 'Dr. Rajesh Raman', 'FACULTY', '2026-10-10 14:00:00', 'Verified notebook and peer confirmation. Approved.');

INSERT IGNORE INTO attendance_risk_settings (id, high_risk_threshold, medium_risk_threshold, recent_absence_trend_days, warning_consecutive_absences) VALUES
('default', 75.00, 80.00, 14, 3);

INSERT IGNORE INTO grade_rules (grade, min_percentage, max_percentage, grade_point, description) VALUES
('O', 90.00, 100.00, 10.00, 'Outstanding'),
('A+', 80.00, 89.99, 9.00, 'Excellent'),
('A', 70.00, 79.99, 8.00, 'Very Good'),
('B+', 60.00, 69.99, 7.00, 'Good'),
('B', 50.00, 59.99, 6.00, 'Above Average'),
('C', 45.00, 49.99, 5.00, 'Pass'),
('RA', 0.00, 44.99, 0.00, 'Re-appear (Fail)');

INSERT IGNORE INTO exams (id, name, code, academic_year, semester, start_date, end_date, status, published_at, published_by) VALUES
('exam-autumn-2024', 'End Semester Examinations - Autumn 2024', 'ESE-NOV-2024', '2024-2025', 3, '2024-11-18', '2024-11-30', 'PUBLISHED', '2024-12-20 10:00:00', 'Dr. A. K. Sundaram (Registrar)'),
('exam-spring-2025', 'End Semester Examinations - Spring 2025', 'ESE-MAY-2025', '2024-2025', 4, '2025-05-05', '2025-05-20', 'PUBLISHED', '2025-06-20 11:00:00', 'Dr. A. K. Sundaram (Registrar)'),
('exam-midterm-2026', 'Mid-Semester Internal Assessment - Autumn 2026', 'MIA-OCT-2026', '2026-2027', 5, '2026-10-05', '2026-10-10', 'PUBLISHED', '2026-10-15 10:00:00', 'Dr. A. K. Sundaram (Registrar)'),
('exam-autumn-2026', 'End Semester Theory Examinations - Autumn 2026', 'ESE-NOV-2026', '2026-2027', 5, '2026-11-16', '2026-11-28', 'READY_TO_PUBLISH', NULL, NULL);

INSERT IGNORE INTO exam_subjects (id, exam_id, subject_id, exam_date, max_marks, pass_marks) VALUES
('es-1', 'exam-autumn-2026', 'sub-cs501', '2026-11-16', 100, 45),
('es-2', 'exam-autumn-2026', 'sub-cs502', '2026-11-18', 100, 45),
('es-3', 'exam-autumn-2026', 'sub-cs503', '2026-11-20', 100, 45),
('es-4', 'exam-autumn-2026', 'sub-cs504', '2026-11-23', 100, 45),
('es-5', 'exam-autumn-2026', 'sub-cs505', '2026-11-25', 50, 25),
('es-6', 'exam-spring-2025', 'sub-cs401', '2025-05-06', 100, 45),
('es-7', 'exam-spring-2025', 'sub-cs402', '2025-05-08', 100, 45),
('es-8', 'exam-spring-2025', 'sub-cs403', '2025-05-12', 100, 45),
('es-9', 'exam-spring-2025', 'sub-cs404', '2025-05-15', 100, 45),
('es-10', 'exam-autumn-2024', 'sub-cs301', '2024-11-20', 100, 45);

INSERT IGNORE INTO student_marks (id, exam_id, subject_id, student_id, status, marks_obtained, grade, grade_point, is_passed, entered_by_faculty_id, last_updated) VALUES
('mk-1-1', 'exam-autumn-2026', 'sub-cs501', 'stu-1', 'MARKS_ENTERED', 92.00, 'O', 10.00, 1, 'fac-1', '2026-10-18 10:00:00'),
('mk-1-2', 'exam-autumn-2026', 'sub-cs502', 'stu-1', 'MARKS_ENTERED', 88.00, 'A+', 9.00, 1, 'fac-2', '2026-10-18 10:30:00'),
('mk-1-3', 'exam-autumn-2026', 'sub-cs503', 'stu-1', 'MARKS_ENTERED', 84.00, 'A+', 9.00, 1, 'fac-2', '2026-10-18 11:00:00'),
('mk-1-4', 'exam-autumn-2026', 'sub-cs504', 'stu-1', 'MARKS_ENTERED', 91.00, 'O', 10.00, 1, 'fac-1', '2026-10-18 11:30:00'),
('mk-1-5', 'exam-autumn-2026', 'sub-cs505', 'stu-1', 'MARKS_ENTERED', 48.00, 'O', 10.00, 1, 'fac-1', '2026-10-18 12:00:00'),
('mk-2-1', 'exam-autumn-2026', 'sub-cs501', 'stu-2', 'MARKS_ENTERED', 76.00, 'A', 8.00, 1, 'fac-1', '2026-10-18 10:00:00'),
('mk-2-2', 'exam-autumn-2026', 'sub-cs502', 'stu-2', 'MARKS_ENTERED', 74.00, 'A', 8.00, 1, 'fac-2', '2026-10-18 10:30:00'),
('mk-2-3', 'exam-autumn-2026', 'sub-cs503', 'stu-2', 'MARKS_ENTERED', 68.00, 'B+', 7.00, 1, 'fac-2', '2026-10-18 11:00:00'),
('mk-2-4', 'exam-autumn-2026', 'sub-cs504', 'stu-2', 'MARKS_ENTERED', 80.00, 'A+', 9.00, 1, 'fac-1', '2026-10-18 11:30:00'),
('mk-2-5', 'exam-autumn-2026', 'sub-cs505', 'stu-2', 'MARKS_ENTERED', 44.00, 'A+', 9.00, 1, 'fac-1', '2026-10-18 12:00:00'),
('mk-3-1', 'exam-autumn-2026', 'sub-cs501', 'stu-3', 'MARKS_ENTERED', 62.00, 'B+', 7.00, 1, 'fac-1', '2026-10-18 10:00:00'),
('mk-3-2', 'exam-autumn-2026', 'sub-cs502', 'stu-3', 'MARKS_ENTERED', 55.00, 'B', 6.00, 1, 'fac-2', '2026-10-18 10:30:00'),
('mk-3-3', 'exam-autumn-2026', 'sub-cs503', 'stu-3', 'MEDICAL_ABSENCE', NULL, 'RA', 0.00, 0, 'fac-2', '2026-10-18 11:00:00'),
('mk-3-4', 'exam-autumn-2026', 'sub-cs504', 'stu-3', 'MARKS_ENTERED', 58.00, 'B', 6.00, 1, 'fac-1', '2026-10-18 11:30:00'),
('mk-3-5', 'exam-autumn-2026', 'sub-cs505', 'stu-3', 'MARKS_ENTERED', 38.00, 'A', 8.00, 1, 'fac-1', '2026-10-18 12:00:00'),
('mk-4-1', 'exam-autumn-2026', 'sub-cs501', 'stu-4', 'ABSENT', NULL, 'RA', 0.00, 0, 'fac-1', '2026-10-18 10:00:00'),
('mk-4-2', 'exam-autumn-2026', 'sub-cs502', 'stu-4', 'MARKS_ENTERED', 38.00, 'RA', 0.00, 0, 'fac-2', '2026-10-18 10:30:00'),
('mk-4-3', 'exam-autumn-2026', 'sub-cs503', 'stu-4', 'MARKS_ENTERED', 46.00, 'C', 5.00, 1, 'fac-2', '2026-10-18 11:00:00'),
('mk-4-4', 'exam-autumn-2026', 'sub-cs504', 'stu-4', 'MARKS_ENTERED', 48.00, 'C', 5.00, 1, 'fac-1', '2026-10-18 11:30:00'),
('mk-4-5', 'exam-autumn-2026', 'sub-cs505', 'stu-4', 'MARKS_ENTERED', 30.00, 'B+', 7.00, 1, 'fac-1', '2026-10-18 12:00:00');

INSERT IGNORE INTO semester_results (id, student_id, exam_id, semester, academic_year, total_credits, earned_credits, semester_gpa, overall_cgpa, overall_result, published_at) VALUES
('res-1-spring25', 'stu-1', 'exam-spring-2025', 4, '2024-2025', 14.0, 14.0, 9.50, 9.42, 'PASS', '2025-06-20 11:00:00'),
('res-2-spring25', 'stu-2', 'exam-spring-2025', 4, '2024-2025', 14.0, 14.0, 8.21, 8.15, 'PASS', '2025-06-20 11:00:00');

INSERT IGNORE INTO semester_result_subjects (id, result_id, subject_id, subject_code, subject_name, credits, max_marks, marks_obtained, status, grade, grade_point, is_passed) VALUES
('rsub-1-1', 'res-1-spring25', 'sub-cs401', 'CS401', 'Theory of Computation', 4.0, 100, 94.00, 'MARKS_ENTERED', 'O', 10.00, 1),
('rsub-1-2', 'res-1-spring25', 'sub-cs402', 'CS402', 'Microprocessors & Microcontrollers', 3.0, 100, 86.00, 'MARKS_ENTERED', 'A+', 9.00, 1),
('rsub-1-3', 'res-1-spring25', 'sub-cs403', 'CS403', 'Software Engineering', 3.0, 100, 90.00, 'MARKS_ENTERED', 'O', 10.00, 1),
('rsub-1-4', 'res-1-spring25', 'sub-cs404', 'CS404', 'Probability & Queueing Theory', 4.0, 100, 88.00, 'MARKS_ENTERED', 'A+', 9.00, 1),
('rsub-2-1', 'res-2-spring25', 'sub-cs401', 'CS401', 'Theory of Computation', 4.0, 100, 78.00, 'MARKS_ENTERED', 'A', 8.00, 1),
('rsub-2-2', 'res-2-spring25', 'sub-cs402', 'CS402', 'Microprocessors & Microcontrollers', 3.0, 100, 80.00, 'MARKS_ENTERED', 'A+', 9.00, 1),
('rsub-2-3', 'res-2-spring25', 'sub-cs403', 'CS403', 'Software Engineering', 3.0, 100, 72.00, 'MARKS_ENTERED', 'A', 8.00, 1),
('rsub-2-4', 'res-2-spring25', 'sub-cs404', 'CS404', 'Probability & Queueing Theory', 4.0, 100, 70.00, 'MARKS_ENTERED', 'A', 8.00, 1);

INSERT IGNORE INTO arrear_records (id, student_id, subject_id, original_exam_id, original_grade, cleared_in_exam_id, cleared_grade, status) VALUES
('arr-1', 'stu-4', 'sub-cs301', 'exam-autumn-2024', 'RA', NULL, NULL, 'REGISTERED');

INSERT IGNORE INTO complaints (id, ticket_number, title, description, category, requested_priority, official_priority, status, submitted_by_user_id, submitter_name, submitter_role, submitter_email, assigned_to_faculty_id, assigned_faculty_name, submitted_at, updated_at, resolution_notes, rejection_reason) VALUES
('cmp-101', 'CMP-2026-0101', 'AC unit in CS-LAB-2 malfunctioning during heavy GPU compilation', 'The split AC unit near row 3 is blowing ambient warm air. Workstations 14 to 20 overheat and shut down during Deep Learning labs.', 'INFRASTRUCTURE', 'HIGH', 'HIGH', 'IN_PROGRESS', 'usr-fac-1', 'Dr. Rajesh Raman', 'FACULTY', 'rajesh.raman@smartcampus.edu', 'fac-1', 'Dr. Rajesh Raman (Lab Incharge)', '2026-10-15 09:12:00', '2026-10-16 14:30:00', 'HVAC technician visit scheduled for Oct 20th morning.', NULL),
('cmp-102', 'CMP-2026-0102', 'Attendance discrepancy after attending IEEE Tech Symposium OD', 'Attended IEEE international symposium as university representative on Oct 16th with prior permission, but portal marked as unexcused absent.', 'ATTENDANCE', 'HIGH', 'MEDIUM', 'UNDER_REVIEW', 'usr-stu-1', 'Ananya Sharma', 'STUDENT', 'ananya.s@smartcampus.edu', NULL, NULL, '2026-10-17 12:05:00', '2026-10-18 09:00:00', NULL, NULL),
('cmp-103', 'CMP-2026-0103', 'Projector HDMI flicker in Lecture Hall LH-101', 'Signal keeps disconnecting every few minutes while displaying slides. Impeding class lectures.', 'ACADEMIC', 'MEDIUM', 'MEDIUM', 'RESOLVED', 'usr-fac-2', 'Prof. Priya Nair', 'FACULTY', 'priya.nair@smartcampus.edu', NULL, NULL, '2026-10-10 11:30:00', '2026-10-12 16:00:00', 'HDMI transmitter module and ceiling port cabling replaced by IT helpdesk.', NULL),
('cmp-104', 'CMP-2026-0104', 'Wi-Fi mesh connectivity drops in Block 4 Girls Hostel reading room', 'During evening study hours 8 PM - 11 PM the signal drops persistently, making digital library access difficult.', 'HOSTEL', 'HIGH', 'HIGH', 'SUBMITTED', 'usr-stu-4', 'Meera Krishnan', 'STUDENT', 'meera.k@smartcampus.edu', NULL, NULL, '2026-10-19 06:45:00', '2026-10-19 06:45:00', NULL, NULL);

INSERT IGNORE INTO complaint_timeline (id, complaint_id, status, timestamp, changed_by, notes) VALUES
('ctl-1', 'cmp-101', 'SUBMITTED', '2026-10-15 09:12:00', 'Dr. Rajesh Raman', NULL),
('ctl-2', 'cmp-101', 'UNDER_REVIEW', '2026-10-15 11:00:00', 'Administrator', 'Priority confirmed as HIGH due to lab impact.'),
('ctl-3', 'cmp-101', 'IN_PROGRESS', '2026-10-16 14:30:00', 'Estate Maintenance Team', 'Work order #WO-891 created.'),
('ctl-4', 'cmp-102', 'SUBMITTED', '2026-10-17 12:05:00', 'Ananya Sharma', NULL),
('ctl-5', 'cmp-102', 'UNDER_REVIEW', '2026-10-18 09:00:00', 'Administrator', 'Cross-verifying with HOD CSE office.'),
('ctl-6', 'cmp-103', 'SUBMITTED', '2026-10-10 11:30:00', 'Prof. Priya Nair', NULL),
('ctl-7', 'cmp-103', 'IN_PROGRESS', '2026-10-11 10:00:00', 'Campus IT Desk', NULL),
('ctl-8', 'cmp-103', 'RESOLVED', '2026-10-12 16:00:00', 'Campus IT Desk', 'Cable harness swapped and tested.'),
('ctl-9', 'cmp-104', 'SUBMITTED', '2026-10-19 06:45:00', 'Meera Krishnan', NULL);

INSERT IGNORE INTO announcements (id, title, content, author_id, author_name, scope, target_department_id, target_course_id, target_semester, priority, published_at, expiry_date) VALUES
('anc-1', 'Mandatory Attendance Review and 75% Threshold Compliance for Autumn 2026', 'All students are reminded that university regulations mandate a minimum of 75% attendance in each subject to be eligible for End Semester Examinations. Students in Medium/High risk categories must immediately consult their faculty mentors.', 'usr-admin-1', 'Office of the Registrar', 'COLLEGE_WIDE', NULL, NULL, NULL, 'URGENT', '2026-10-15 09:00:00', NULL),
('anc-2', 'Autumn 2026 End Semester Examination Schedule & Hall Ticket Issuance', 'The draft timetable for Autumn 2026 Theory & Practical Examinations has been published on the portal. Faculty members are requested to complete marks entry for all continuous assessments before the cutoff date.', 'usr-admin-1', 'Controller of Examinations', 'COLLEGE_WIDE', NULL, NULL, NULL, 'NORMAL', '2026-10-17 14:30:00', NULL),
('anc-3', 'CSE Department Technical Symposium & Project Exhibition Call for Papers', 'The Department of Computer Science & Engineering invites student project submissions for INNOVA 2026. Cash awards will be granted to the top 3 best capstone innovations.', 'usr-fac-1', 'Dr. Rajesh Raman (HOD CSE)', 'DEPARTMENT', 'dept-cse', NULL, NULL, 'NORMAL', '2026-10-18 10:00:00', NULL);

INSERT IGNORE INTO notifications (id, recipient_user_id, title, message, category, reference_id, is_read, created_at) VALUES
('notif-1', 'usr-stu-1', 'Attendance Correction Submitted', 'Your request for Oct 16th (OS Lab - OD) has been routed to Dr. Rajesh Raman for review.', 'CORRECTION_STATUS', 'req-att-1', 0, '2026-10-17 11:21:00'),
('notif-2', 'usr-stu-1', 'Complaint Under Review', 'Ticket CMP-2026-0102 has been received and is currently under administrative review.', 'COMPLAINT_UPDATE', 'cmp-102', 1, '2026-10-18 09:05:00'),
('notif-3', 'usr-stu-4', 'High Attendance Risk Warning', 'Your current overall attendance is below the mandatory 75% threshold.', 'ATTENDANCE_WARNING', NULL, 0, '2026-10-16 12:00:00'),
('notif-4', 'usr-fac-1', 'Pending Attendance Correction', 'Ananya Sharma (21CS101) requested an attendance change for session on 2026-10-16 (Within 7-day window).', 'CORRECTION_STATUS', 'req-att-1', 0, '2026-10-17 11:21:00'),
('notif-5', 'usr-admin-1', 'Escalated Late Attendance Request', 'Ananya Sharma requested correction for session on 2026-10-02 (Exceeds 7-day faculty window). Requires Administrator review.', 'CORRECTION_STATUS', 'req-att-3', 0, '2026-10-18 10:16:00'),
('notif-6', 'usr-admin-1', 'Examinations Ready for Review', 'All marks entered for ESE-NOV-2026. Verify resolution and publish when ready.', 'EXAM_UPDATE', 'exam-autumn-2026', 1, '2026-10-18 16:00:00');

INSERT IGNORE INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, details, timestamp, ip_address) VALUES
('aud-1', 'usr-fac-1', 'Dr. Rajesh Raman', 'FACULTY', 'RECORD_ATTENDANCE', 'ATTENDANCE', 'sess-1', 'Recorded attendance for CS501 Operating Systems (CSE-5A) - 62 Present, 2 Absent.', '2026-10-16 09:55:00', '192.168.10.45'),
('aud-2', 'usr-fac-1', 'Dr. Rajesh Raman', 'FACULTY', 'APPROVE_ATTENDANCE_CORRECTION', 'ATTENDANCE', 'req-att-4', 'Approved correction request for Rohan Varma (21CS102) for session on 2026-10-08 within 7-day window.', '2026-10-10 14:00:00', '192.168.10.45'),
('aud-3', 'usr-admin-1', 'Dr. A. K. Sundaram (Registrar)', 'ADMIN', 'PUBLISH_RESULTS', 'EXAM', 'exam-midterm-2026', 'Published official results for Mid-Semester Internal Assessment - Autumn 2026 after full integrity check.', '2026-10-15 10:00:00', '192.168.1.10'),
('aud-4', 'usr-admin-1', 'Dr. A. K. Sundaram (Registrar)', 'ADMIN', 'UPDATE_COMPLAINT_PRIORITY', 'COMPLAINT', 'cmp-101', 'Confirmed priority as HIGH for Lab 2 AC failure. Assigned to Estate Maintenance.', '2026-10-15 11:00:00', '192.168.1.10');

INSERT IGNORE INTO student_enrollments (id, student_id, register_number, student_name, course_id, course_name, department_id, department_code, academic_year, semester, class_group_id, class_group_name, enrollment_date, status, credits_registered, remarks) VALUES
('enr-1-5', 'stu-1', '21CS101', 'Ananya Sharma', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2026-2027', 5, 'cg-cse-5a', 'B.Tech Computer Science & Engineering - Semester 5 - Section A', '2026-08-03', 'ACTIVE', 17.0, 'Regular semester enrolment'),
('enr-1-4', 'stu-1', '21CS101', 'Ananya Sharma', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2024-2025', 4, 'cg-cse-4a', 'CSE - Semester 4 (Sec A)', '2025-01-05', 'PROMOTED', 14.0, 'Promoted with 9.50 GPA'),
('enr-1-3', 'stu-1', '21CS101', 'Ananya Sharma', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2024-2025', 3, 'cg-cse-3a', 'CSE - Semester 3 (Sec A)', '2024-08-02', 'PROMOTED', 18.0, 'Promoted with 9.38 GPA'),
('enr-2-5', 'stu-2', '21CS102', 'Rohan Varma', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2026-2027', 5, 'cg-cse-5a', 'B.Tech Computer Science & Engineering - Semester 5 - Section A', '2026-08-03', 'ACTIVE', 17.0, 'Regular semester enrolment'),
('enr-3-5', 'stu-3', '21CS103', 'Karthik Raja', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2026-2027', 5, 'cg-cse-5a', 'B.Tech Computer Science & Engineering - Semester 5 - Section A', '2026-08-03', 'ACTIVE', 17.0, 'Regular semester enrolment'),
('enr-4-5', 'stu-4', '21CS104', 'Meera Krishnan', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2026-2027', 5, 'cg-cse-5a', 'B.Tech Computer Science & Engineering - Semester 5 - Section A', '2026-08-03', 'ACTIVE', 17.0, 'Regular semester enrolment'),
('enr-5-5', 'stu-5', '21CS105', 'Arjun Das', 'crs-btech-cse', 'B.Tech in Computer Science & Engineering', 'dept-cse', 'CSE', '2026-2027', 5, 'cg-cse-5a', 'B.Tech Computer Science & Engineering - Semester 5 - Section A', '2026-08-03', 'SUSPENDED', 17.0, 'Suspended - Inactive academic account');

INSERT IGNORE INTO admission_applications (id, application_number, applicant_name, email, phone, date_of_birth, department_id, course_id, applied_semester, academic_year, previous_qualification, percentage_or_gpa, status, submitted_at, reviewed_by, reviewed_at, review_remarks, assigned_class_group_id, generated_register_number) VALUES
('app-101', 'ADM-2026-0814', 'Swarna Lakshmi', 'swarna.l@gmail.com', '+91 98409 11223', '2005-04-18', 'dept-cse', 'crs-btech-cse', 1, '2026-2027', 'Higher Secondary (PCM) - CBSE', '94.8%', 'SUBMITTED', '2026-10-18 09:30:00', NULL, NULL, NULL, NULL, NULL),
('app-102', 'ADM-2026-0815', 'Vikramaditya Bose', 'vikram.bose@gmail.com', '+91 98408 22334', '2005-07-22', 'dept-ece', 'crs-btech-ece', 1, '2026-2027', 'Higher Secondary (PCM) - State Board', '91.2%', 'UNDER_REVIEW', '2026-10-17 14:15:00', 'Dr. A. K. Sundaram (Registrar)', '2026-10-18 11:00:00', 'Eligible. Documents under board verification.', NULL, NULL),
('app-103', 'ADM-2026-0816', 'Tanvi Deshmukh', 'tanvi.deshmukh@yahoo.com', '+91 98407 33445', '2004-11-10', 'dept-cse', 'crs-btech-cse', 3, '2025-2026', 'Diploma in Computer Technology (State Tech Board)', '89.4%', 'APPROVED', '2026-10-10 10:00:00', 'Dr. A. K. Sundaram (Registrar)', '2026-10-12 16:30:00', 'Lateral entry verified. Section A assigned.', 'cg-cse-3a', '21CS106'),
('app-104', 'ADM-2026-0817', 'Rahul Sen', 'rahul.sen@outlook.com', '+91 98406 44556', '2005-02-14', 'dept-mech', 'crs-btech-cse', 1, '2026-2027', 'Higher Secondary (Non-Science)', '62.0%', 'REJECTED', '2026-10-14 11:20:00', 'Dr. A. K. Sundaram (Registrar)', '2026-10-15 15:00:00', 'Mandatory Mathematics and Physics prerequisites not satisfied per university criteria.', NULL, NULL);
