package com.smartcampus.erp.enrollment;

import com.smartcampus.erp.common.Sql;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class EnrollmentRepository {
    private static final RowMapper<StudentEnrollment> ENROLLMENT_MAPPER = (rs, rowNum) -> new StudentEnrollment(
            rs.getString("id"),
            rs.getString("student_id"),
            rs.getString("register_number"),
            rs.getString("student_name"),
            rs.getString("course_id"),
            rs.getString("course_name"),
            rs.getString("department_id"),
            rs.getString("department_code"),
            rs.getString("academic_year"),
            rs.getInt("semester"),
            rs.getString("class_group_id"),
            rs.getString("class_group_name"),
            Sql.date(rs, "enrollment_date"),
            rs.getString("status"),
            rs.getBigDecimal("credits_registered"),
            rs.getString("remarks"));

    private static final RowMapper<AdmissionApplication> ADMISSION_MAPPER = (rs, rowNum) -> new AdmissionApplication(
            rs.getString("id"),
            rs.getString("application_number"),
            rs.getString("applicant_name"),
            rs.getString("email"),
            rs.getString("phone"),
            Sql.date(rs, "date_of_birth"),
            rs.getString("department_id"),
            rs.getString("department_code"),
            rs.getString("department_name"),
            rs.getString("course_id"),
            rs.getString("course_name"),
            rs.getInt("applied_semester"),
            rs.getString("academic_year"),
            rs.getString("previous_qualification"),
            rs.getString("percentage_or_gpa"),
            rs.getString("status"),
            Sql.dateTime(rs, "submitted_at"),
            rs.getString("reviewed_by"),
            Sql.dateTime(rs, "reviewed_at"),
            rs.getString("review_remarks"),
            rs.getString("assigned_class_group_id"),
            rs.getString("generated_register_number"));

    private static final String ADMISSION_SQL = "SELECT a.*, d.code AS department_code,"
            + " d.name AS department_name, c.name AS course_name"
            + " FROM admission_applications a"
            + " JOIN departments d ON d.id = a.department_id"
            + " JOIN courses c ON c.id = a.course_id";

    private final JdbcTemplate jdbc;

    public EnrollmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<StudentEnrollment> enrollments(String studentId, String status,
                                               String academicYear, Integer semester) {
        StringBuilder sql = new StringBuilder("SELECT * FROM student_enrollments WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (studentId != null && !studentId.isBlank()) {
            sql.append(" AND student_id = ?");
            params.add(studentId);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ?");
            params.add(status);
        }
        if (academicYear != null && !academicYear.isBlank()) {
            sql.append(" AND academic_year = ?");
            params.add(academicYear);
        }
        if (semester != null) {
            sql.append(" AND semester = ?");
            params.add(semester);
        }
        sql.append(" ORDER BY academic_year DESC, semester DESC, register_number");
        return jdbc.query(sql.toString(), ENROLLMENT_MAPPER, params.toArray());
    }

    public List<StudentEnrollment> activeEnrollmentsForTerm(String academicYear, int semester) {
        return jdbc.query("SELECT * FROM student_enrollments WHERE status = 'ACTIVE'"
                        + " AND academic_year = ? AND semester = ? ORDER BY register_number",
                ENROLLMENT_MAPPER, academicYear, semester);
    }

    public Optional<StudentEnrollment> enrollment(String studentId, String academicYear, int semester) {
        return jdbc.query("SELECT * FROM student_enrollments WHERE student_id = ?"
                        + " AND academic_year = ? AND semester = ?",
                ENROLLMENT_MAPPER, studentId, academicYear, semester).stream().findFirst();
    }

    public Optional<StudentEnrollment> enrollmentById(String id) {
        return jdbc.query("SELECT * FROM student_enrollments WHERE id = ?", ENROLLMENT_MAPPER, id)
                .stream().findFirst();
    }

    public Optional<StudentEnrollment> activeEnrollment(String studentId) {
        return jdbc.query("SELECT * FROM student_enrollments WHERE student_id = ? AND status = 'ACTIVE'"
                        + " ORDER BY academic_year DESC, semester DESC LIMIT 1",
                ENROLLMENT_MAPPER, studentId).stream().findFirst();
    }

    public void insertEnrollment(StudentEnrollment enrollment) {
        jdbc.update("INSERT INTO student_enrollments (id, student_id, register_number, student_name,"
                        + " course_id, course_name, department_id, department_code, academic_year, semester,"
                        + " class_group_id, class_group_name, enrollment_date, status, credits_registered, remarks)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                enrollment.id(), enrollment.studentId(), enrollment.registerNumber(), enrollment.studentName(),
                enrollment.courseId(), enrollment.courseName(), enrollment.departmentId(),
                enrollment.departmentCode(), enrollment.academicYear(), enrollment.semester(),
                enrollment.classGroupId(), enrollment.classGroupName(), enrollment.enrollmentDate(),
                enrollment.status(), enrollment.creditsRegistered(), enrollment.remarks());
    }

    public void updateEnrollmentStatus(String id, String status, String remarks) {
        jdbc.update("UPDATE student_enrollments SET status = ?, remarks = ? WHERE id = ?",
                status, remarks, id);
    }

    public List<AdmissionApplication> admissions(String status) {
        StringBuilder sql = new StringBuilder(ADMISSION_SQL + " WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append(" AND a.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY a.submitted_at DESC");
        return jdbc.query(sql.toString(), ADMISSION_MAPPER, params.toArray());
    }

    public Optional<AdmissionApplication> admission(String id) {
        return jdbc.query(ADMISSION_SQL + " WHERE a.id = ?", ADMISSION_MAPPER, id).stream().findFirst();
    }

    public void insertAdmission(AdmissionApplication application) {
        jdbc.update("INSERT INTO admission_applications (id, application_number, applicant_name, email,"
                        + " phone, date_of_birth, department_id, course_id, applied_semester, academic_year,"
                        + " previous_qualification, percentage_or_gpa, status, submitted_at, reviewed_by,"
                        + " reviewed_at, review_remarks, assigned_class_group_id, generated_register_number)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                application.id(), application.applicationNumber(), application.applicantName(),
                application.email(), application.phone(), application.dateOfBirth(),
                application.departmentId(), application.courseId(), application.appliedSemester(),
                application.academicYear(), application.previousQualification(),
                application.percentageOrGpa(), application.status(), application.submittedAt(),
                application.reviewedBy(), application.reviewedAt(), application.reviewRemarks(),
                application.assignedClassGroupId(), application.generatedRegisterNumber());
    }

    public String nextAdmissionNumber(String prefix) {
        Integer max = jdbc.queryForObject("SELECT COALESCE(MAX(CAST(SUBSTRING(application_number, ?)"
                        + " AS UNSIGNED)), 1000) FROM admission_applications WHERE application_number LIKE ?",
                Integer.class, prefix.length() + 1, prefix + "%");
        int sequence = (max == null ? 1000 : max) + 1;
        String candidate = prefix + String.format("%04d", sequence);
        while (admissionNumberExists(candidate)) {
            sequence++;
            candidate = prefix + String.format("%04d", sequence);
        }
        return candidate;
    }

    private boolean admissionNumberExists(String applicationNumber) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM admission_applications"
                + " WHERE application_number = ?", Long.class, applicationNumber);
        return count != null && count > 0;
    }

    public void updateAdmission(String id, String status, String reviewedBy,
                                java.time.LocalDateTime reviewedAt, String remarks,
                                String classGroupId, String registerNumber) {
        jdbc.update("UPDATE admission_applications SET status = ?, reviewed_by = ?, reviewed_at = ?,"
                        + " review_remarks = ?, assigned_class_group_id = ?, generated_register_number = ?"
                        + " WHERE id = ?",
                status, reviewedBy, reviewedAt, remarks, classGroupId, registerNumber, id);
    }

    public void incrementClassGroup(String classGroupId, int delta) {
        jdbc.update("UPDATE class_groups SET total_students = total_students + ? WHERE id = ?",
                delta, classGroupId);
    }

    public int nextRegisterSequence(String prefix) {
        Integer max = jdbc.queryForObject("SELECT COALESCE(MAX(CAST(SUBSTRING(register_number, ?) AS UNSIGNED)), 100)"
                        + " FROM student_profiles WHERE register_number LIKE ?",
                Integer.class, prefix.length() + 1, prefix + "%");
        return max == null ? 101 : max + 1;
    }

    public boolean registerNumberExists(String registerNumber) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM student_profiles"
                + " WHERE LOWER(register_number) = LOWER(?)", Long.class, registerNumber);
        return count != null && count > 0;
    }
}
