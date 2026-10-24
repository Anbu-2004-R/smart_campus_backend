-- Smart Campus ERP - MySQL 5.5 compatible schema
-- All identifiers are VARCHAR so the API can preserve the frontend's string IDs.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL,
  login_id VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(16) NOT NULL,
  status VARCHAR(24) NOT NULL,
  created_at DATETIME NOT NULL,
  last_login DATETIME NULL,
  avatar_url VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_login (login_id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(64) NOT NULL,
  code VARCHAR(16) NOT NULL,
  name VARCHAR(160) NOT NULL,
  hod_name VARCHAR(120) NOT NULL,
  faculty_count INT NOT NULL DEFAULT 0,
  student_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_departments_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) NOT NULL,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(160) NOT NULL,
  department_id VARCHAR(64) NOT NULL,
  total_semesters INT NOT NULL,
  degree_type VARCHAR(24) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_courses_code (code),
  KEY idx_courses_dept (department_id),
  CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES departments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_groups (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(180) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  section VARCHAR(8) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  total_students INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_class_groups_course (course_id),
  KEY idx_class_groups_sem (semester, academic_year),
  CONSTRAINT fk_class_groups_course FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_profiles (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  register_number VARCHAR(32) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  department_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  current_semester INT NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(32) NULL,
  date_of_birth DATE NULL,
  avatar_url VARCHAR(255) NULL,
  class_group_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_students_user (user_id),
  UNIQUE KEY uk_students_register (register_number),
  KEY idx_students_dept (department_id),
  KEY idx_students_course (course_id),
  KEY idx_students_class (class_group_id),
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments (id),
  CONSTRAINT fk_students_course FOREIGN KEY (course_id) REFERENCES courses (id),
  CONSTRAINT fk_students_class FOREIGN KEY (class_group_id) REFERENCES class_groups (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faculty_profiles (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  employee_id VARCHAR(32) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  department_id VARCHAR(64) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(32) NULL,
  designation VARCHAR(120) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_faculty_user (user_id),
  UNIQUE KEY uk_faculty_employee (employee_id),
  KEY idx_faculty_dept (department_id),
  CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) REFERENCES departments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(64) NOT NULL,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(160) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  credits DECIMAL(4,1) NOT NULL,
  max_marks INT NOT NULL,
  pass_marks INT NOT NULL,
  type VARCHAR(16) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subjects_code (code),
  KEY idx_subjects_course_sem (course_id, semester),
  CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faculty_subject_assignments (
  id VARCHAR(64) NOT NULL,
  faculty_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  class_group_id VARCHAR(64) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  semester INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_assign_faculty (faculty_id),
  KEY idx_assign_subject (subject_id),
  KEY idx_assign_class (class_group_id),
  CONSTRAINT fk_assign_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id),
  CONSTRAINT fk_assign_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_assign_class FOREIGN KEY (class_group_id) REFERENCES class_groups (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS classrooms (
  id VARCHAR(64) NOT NULL,
  room_number VARCHAR(32) NOT NULL,
  building VARCHAR(120) NOT NULL,
  floor INT NOT NULL,
  capacity INT NOT NULL,
  type VARCHAR(24) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_classrooms_number (room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timetable_entries (
  id VARCHAR(64) NOT NULL,
  day_of_week VARCHAR(16) NOT NULL,
  period INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_group_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  faculty_id VARCHAR(64) NOT NULL,
  classroom_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tt_group (day_of_week, period, class_group_id),
  UNIQUE KEY uk_tt_faculty (day_of_week, period, faculty_id),
  UNIQUE KEY uk_tt_room (day_of_week, period, classroom_id),
  KEY idx_tt_subject (subject_id),
  CONSTRAINT fk_tt_class FOREIGN KEY (class_group_id) REFERENCES class_groups (id),
  CONSTRAINT fk_tt_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_tt_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id),
  CONSTRAINT fk_tt_room FOREIGN KEY (classroom_id) REFERENCES classrooms (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_sessions (
  id VARCHAR(64) NOT NULL,
  assignment_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  class_group_id VARCHAR(64) NOT NULL,
  faculty_id VARCHAR(64) NOT NULL,
  session_date DATE NOT NULL,
  period INT NOT NULL,
  room_number VARCHAR(32) NULL,
  topic_covered VARCHAR(255) NULL,
  marked_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sessions_date (session_date),
  KEY idx_sessions_class (class_group_id),
  KEY idx_sessions_faculty (faculty_id),
  CONSTRAINT fk_sessions_assignment FOREIGN KEY (assignment_id) REFERENCES faculty_subject_assignments (id),
  CONSTRAINT fk_sessions_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_sessions_class FOREIGN KEY (class_group_id) REFERENCES class_groups (id),
  CONSTRAINT fk_sessions_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL,
  remarks VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_attendance_session_student (session_id, student_id),
  KEY idx_attendance_student (student_id),
  CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES class_sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES student_profiles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_correction_requests (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  session_date DATE NOT NULL,
  original_status VARCHAR(16) NOT NULL,
  requested_status VARCHAR(16) NOT NULL,
  reason TEXT NOT NULL,
  evidence_note VARCHAR(255) NULL,
  status VARCHAR(24) NOT NULL,
  is_eligible_for_faculty BOOLEAN NOT NULL DEFAULT 1,
  submitted_at DATETIME NOT NULL,
  reviewed_by VARCHAR(120) NULL,
  reviewer_role VARCHAR(16) NULL,
  reviewed_at DATETIME NULL,
  review_remarks VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_corrections_status (status),
  KEY idx_corrections_student (student_id),
  CONSTRAINT fk_corrections_student FOREIGN KEY (student_id) REFERENCES student_profiles (id),
  CONSTRAINT fk_corrections_session FOREIGN KEY (session_id) REFERENCES class_sessions (id),
  CONSTRAINT fk_corrections_subject FOREIGN KEY (subject_id) REFERENCES subjects (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_risk_settings (
  id VARCHAR(32) NOT NULL,
  high_risk_threshold DECIMAL(5,2) NOT NULL,
  medium_risk_threshold DECIMAL(5,2) NOT NULL,
  recent_absence_trend_days INT NOT NULL,
  warning_consecutive_absences INT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exams (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(180) NOT NULL,
  code VARCHAR(32) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  semester INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(24) NOT NULL,
  published_at DATETIME NULL,
  published_by VARCHAR(120) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_exams_code (code),
  KEY idx_exams_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_subjects (
  id VARCHAR(64) NOT NULL,
  exam_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  exam_date DATE NOT NULL,
  max_marks INT NOT NULL,
  pass_marks INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_exam_subject (exam_id, subject_id),
  CONSTRAINT fk_exam_subjects_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
  CONSTRAINT fk_exam_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS grade_rules (
  grade VARCHAR(4) NOT NULL,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_point DECIMAL(4,2) NOT NULL,
  description VARCHAR(80) NOT NULL,
  PRIMARY KEY (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_marks (
  id VARCHAR(64) NOT NULL,
  exam_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL,
  marks_obtained DECIMAL(6,2) NULL,
  grade VARCHAR(4) NULL,
  grade_point DECIMAL(4,2) NULL,
  is_passed BOOLEAN NULL,
  entered_by_faculty_id VARCHAR(64) NOT NULL,
  last_updated DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_marks_exam_subject_student (exam_id, subject_id, student_id),
  KEY idx_marks_student (student_id),
  KEY idx_marks_exam (exam_id),
  CONSTRAINT fk_marks_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
  CONSTRAINT fk_marks_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES student_profiles (id),
  CONSTRAINT fk_marks_faculty FOREIGN KEY (entered_by_faculty_id) REFERENCES faculty_profiles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marks_correction_requests (
  id VARCHAR(64) NOT NULL,
  exam_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  faculty_id VARCHAR(64) NOT NULL,
  old_marks DECIMAL(6,2) NULL,
  new_marks DECIMAL(6,2) NULL,
  old_status VARCHAR(24) NOT NULL,
  new_status VARCHAR(24) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(16) NOT NULL,
  submitted_at DATETIME NOT NULL,
  reviewed_by_admin_id VARCHAR(64) NULL,
  reviewed_at DATETIME NULL,
  review_notes VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_marks_corr_status (status),
  CONSTRAINT fk_marks_corr_exam FOREIGN KEY (exam_id) REFERENCES exams (id),
  CONSTRAINT fk_marks_corr_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_marks_corr_student FOREIGN KEY (student_id) REFERENCES student_profiles (id),
  CONSTRAINT fk_marks_corr_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS semester_results (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  exam_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  total_credits DECIMAL(5,1) NOT NULL,
  earned_credits DECIMAL(5,1) NOT NULL,
  semester_gpa DECIMAL(4,2) NOT NULL,
  overall_cgpa DECIMAL(4,2) NOT NULL,
  overall_result VARCHAR(16) NOT NULL,
  published_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_results_student_exam (student_id, exam_id),
  KEY idx_results_student (student_id),
  CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES student_profiles (id),
  CONSTRAINT fk_results_exam FOREIGN KEY (exam_id) REFERENCES exams (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS semester_result_subjects (
  id VARCHAR(64) NOT NULL,
  result_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  subject_name VARCHAR(160) NOT NULL,
  credits DECIMAL(4,1) NOT NULL,
  max_marks INT NOT NULL,
  marks_obtained DECIMAL(6,2) NULL,
  status VARCHAR(24) NOT NULL,
  grade VARCHAR(4) NULL,
  grade_point DECIMAL(4,2) NULL,
  is_passed BOOLEAN NOT NULL,
  PRIMARY KEY (id),
  KEY idx_result_subjects_result (result_id),
  CONSTRAINT fk_result_subjects_result FOREIGN KEY (result_id) REFERENCES semester_results (id) ON DELETE CASCADE,
  CONSTRAINT fk_result_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arrear_records (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  original_exam_id VARCHAR(64) NOT NULL,
  original_grade VARCHAR(4) NOT NULL,
  cleared_in_exam_id VARCHAR(64) NULL,
  cleared_grade VARCHAR(4) NULL,
  status VARCHAR(16) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_arrears_student (student_id),
  CONSTRAINT fk_arrears_student FOREIGN KEY (student_id) REFERENCES student_profiles (id),
  CONSTRAINT fk_arrears_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_arrears_original_exam FOREIGN KEY (original_exam_id) REFERENCES exams (id),
  CONSTRAINT fk_arrears_cleared_exam FOREIGN KEY (cleared_in_exam_id) REFERENCES exams (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(64) NOT NULL,
  ticket_number VARCHAR(32) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(24) NOT NULL,
  requested_priority VARCHAR(16) NOT NULL,
  official_priority VARCHAR(16) NOT NULL,
  status VARCHAR(24) NOT NULL,
  submitted_by_user_id VARCHAR(64) NOT NULL,
  submitter_name VARCHAR(120) NOT NULL,
  submitter_role VARCHAR(16) NOT NULL,
  submitter_email VARCHAR(160) NOT NULL,
  assigned_to_faculty_id VARCHAR(64) NULL,
  assigned_faculty_name VARCHAR(160) NULL,
  submitted_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  resolution_notes VARCHAR(255) NULL,
  rejection_reason VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_complaints_ticket (ticket_number),
  KEY idx_complaints_status (status),
  KEY idx_complaints_submitter (submitted_by_user_id),
  KEY idx_complaints_faculty (assigned_to_faculty_id),
  CONSTRAINT fk_complaints_user FOREIGN KEY (submitted_by_user_id) REFERENCES users (id),
  CONSTRAINT fk_complaints_faculty FOREIGN KEY (assigned_to_faculty_id) REFERENCES faculty_profiles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS complaint_timeline (
  id VARCHAR(64) NOT NULL,
  complaint_id VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL,
  timestamp DATETIME NOT NULL,
  changed_by VARCHAR(120) NOT NULL,
  notes VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_timeline_complaint (complaint_id),
  CONSTRAINT fk_timeline_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(120) NOT NULL,
  scope VARCHAR(24) NOT NULL,
  target_department_id VARCHAR(64) NULL,
  target_course_id VARCHAR(64) NULL,
  target_semester INT NULL,
  priority VARCHAR(16) NOT NULL,
  published_at DATETIME NOT NULL,
  expiry_date DATE NULL,
  PRIMARY KEY (id),
  KEY idx_announcements_scope (scope),
  CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) NOT NULL,
  recipient_user_id VARCHAR(64) NOT NULL,
  title VARCHAR(180) NOT NULL,
  message VARCHAR(500) NOT NULL,
  category VARCHAR(32) NOT NULL,
  reference_id VARCHAR(64) NULL,
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_recipient (recipient_user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) NOT NULL,
  actor_user_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(120) NOT NULL,
  actor_role VARCHAR(16) NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(24) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  details VARCHAR(500) NOT NULL,
  timestamp DATETIME NOT NULL,
  ip_address VARCHAR(45) NULL,
  PRIMARY KEY (id),
  KEY idx_audit_timestamp (timestamp),
  KEY idx_audit_actor (actor_user_id),
  KEY idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_enrollments (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  register_number VARCHAR(32) NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  course_name VARCHAR(160) NOT NULL,
  department_id VARCHAR(64) NOT NULL,
  department_code VARCHAR(16) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  semester INT NOT NULL,
  class_group_id VARCHAR(64) NOT NULL,
  class_group_name VARCHAR(180) NOT NULL,
  enrollment_date DATE NOT NULL,
  status VARCHAR(24) NOT NULL,
  credits_registered DECIMAL(5,1) NOT NULL,
  remarks VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_enrollments_student (student_id),
  KEY idx_enrollments_status (status),
  KEY idx_enrollments_term (academic_year, semester),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES student_profiles (id),
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses (id),
  CONSTRAINT fk_enrollments_department FOREIGN KEY (department_id) REFERENCES departments (id),
  CONSTRAINT fk_enrollments_class FOREIGN KEY (class_group_id) REFERENCES class_groups (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admission_applications (
  id VARCHAR(64) NOT NULL,
  application_number VARCHAR(32) NOT NULL,
  applicant_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(32) NULL,
  date_of_birth DATE NULL,
  department_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  applied_semester INT NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  previous_qualification VARCHAR(160) NOT NULL,
  percentage_or_gpa VARCHAR(32) NOT NULL,
  status VARCHAR(24) NOT NULL,
  submitted_at DATETIME NOT NULL,
  reviewed_by VARCHAR(120) NULL,
  reviewed_at DATETIME NULL,
  review_remarks VARCHAR(255) NULL,
  assigned_class_group_id VARCHAR(64) NULL,
  generated_register_number VARCHAR(32) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admissions_number (application_number),
  KEY idx_admissions_status (status),
  CONSTRAINT fk_admissions_department FOREIGN KEY (department_id) REFERENCES departments (id),
  CONSTRAINT fk_admissions_course FOREIGN KEY (course_id) REFERENCES courses (id),
  CONSTRAINT fk_admissions_class FOREIGN KEY (assigned_class_group_id) REFERENCES class_groups (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_tokens (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  token VARCHAR(128) NOT NULL,
  type VARCHAR(24) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_account_tokens_token (token),
  KEY idx_account_tokens_user (user_id),
  CONSTRAINT fk_account_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
