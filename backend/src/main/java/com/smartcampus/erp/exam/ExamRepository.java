package com.smartcampus.erp.exam;

import com.smartcampus.erp.common.Sql;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ExamRepository {
    private static final RowMapper<Exam> EXAM_MAPPER = (rs, rowNum) -> new Exam(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("code"),
            rs.getString("academic_year"),
            rs.getInt("semester"),
            Sql.date(rs, "start_date"),
            Sql.date(rs, "end_date"),
            rs.getString("status"),
            Sql.dateTime(rs, "published_at"),
            rs.getString("published_by"),
            List.of());

    private static final RowMapper<ExamSubjectView> EXAM_SUBJECT_MAPPER = (rs, rowNum) -> new ExamSubjectView(
            rs.getString("id"),
            rs.getString("exam_id"),
            rs.getString("subject_id"),
            rs.getString("subject_code"),
            rs.getString("subject_name"),
            rs.getBigDecimal("credits"),
            Sql.date(rs, "exam_date"),
            rs.getInt("max_marks"),
            rs.getInt("pass_marks"));

    private static final RowMapper<GradeRule> GRADE_MAPPER = (rs, rowNum) -> new GradeRule(
            rs.getString("grade"),
            rs.getBigDecimal("min_percentage"),
            rs.getBigDecimal("max_percentage"),
            rs.getBigDecimal("grade_point"),
            rs.getString("description"));

    private static final RowMapper<MarkView> MARK_MAPPER = (rs, rowNum) -> new MarkView(
            rs.getString("id"),
            rs.getString("exam_id"),
            rs.getString("subject_id"),
            rs.getString("student_id"),
            rs.getString("register_number"),
            rs.getString("student_name"),
            rs.getString("status"),
            rs.getBigDecimal("marks_obtained"),
            rs.getString("grade"),
            rs.getBigDecimal("grade_point"),
            rs.getObject("is_passed") == null ? null : rs.getBoolean("is_passed"),
            rs.getString("entered_by_faculty_id"),
            Sql.dateTime(rs, "last_updated"));

    private static final RowMapper<SemesterResult> RESULT_MAPPER = (rs, rowNum) -> new SemesterResult(
            rs.getString("id"),
            rs.getString("student_id"),
            rs.getString("student_name"),
            rs.getString("register_number"),
            rs.getString("exam_id"),
            rs.getInt("semester"),
            rs.getString("academic_year"),
            rs.getBigDecimal("total_credits"),
            rs.getBigDecimal("earned_credits"),
            rs.getBigDecimal("semester_gpa"),
            rs.getBigDecimal("overall_cgpa"),
            rs.getString("overall_result"),
            Sql.dateTime(rs, "published_at"),
            List.of());

    private static final RowMapper<ResultSubject> RESULT_SUBJECT_MAPPER = (rs, rowNum) -> new ResultSubject(
            rs.getString("id"),
            rs.getString("subject_id"),
            rs.getString("subject_code"),
            rs.getString("subject_name"),
            rs.getBigDecimal("credits"),
            rs.getInt("max_marks"),
            rs.getBigDecimal("marks_obtained"),
            rs.getString("status"),
            rs.getString("grade"),
            rs.getBigDecimal("grade_point"),
            rs.getBoolean("is_passed"));

    private static final RowMapper<ArrearRecord> ARREAR_MAPPER = (rs, rowNum) -> new ArrearRecord(
            rs.getString("id"),
            rs.getString("student_id"),
            rs.getString("subject_id"),
            rs.getString("subject_code"),
            rs.getString("subject_name"),
            rs.getString("original_exam_id"),
            rs.getString("original_grade"),
            rs.getString("cleared_in_exam_id"),
            rs.getString("cleared_grade"),
            rs.getString("status"));

    private static final RowMapper<MarksCorrection> CORRECTION_MAPPER = (rs, rowNum) -> new MarksCorrection(
            rs.getString("id"),
            rs.getString("exam_id"),
            rs.getString("subject_id"),
            rs.getString("subject_code"),
            rs.getString("student_id"),
            rs.getString("student_name"),
            rs.getString("register_number"),
            rs.getString("faculty_id"),
            rs.getString("faculty_name"),
            rs.getBigDecimal("old_marks"),
            rs.getBigDecimal("new_marks"),
            rs.getString("old_status"),
            rs.getString("new_status"),
            rs.getString("reason"),
            rs.getString("status"),
            Sql.dateTime(rs, "submitted_at"),
            rs.getString("reviewed_by_admin_id"),
            Sql.dateTime(rs, "reviewed_at"),
            rs.getString("review_notes"));

    private static final String MARK_SQL = "SELECT m.*, sp.register_number, sp.full_name AS student_name"
            + " FROM student_marks m JOIN student_profiles sp ON sp.id = m.student_id";

    private static final String RESULT_SQL = "SELECT r.*, sp.full_name AS student_name, sp.register_number"
            + " FROM semester_results r JOIN student_profiles sp ON sp.id = r.student_id";

    private static final String CORRECTION_SQL = "SELECT mc.*, s.code AS subject_code,"
            + " sp.full_name AS student_name, sp.register_number, f.full_name AS faculty_name"
            + " FROM marks_correction_requests mc"
            + " JOIN subjects s ON s.id = mc.subject_id"
            + " JOIN student_profiles sp ON sp.id = mc.student_id"
            + " JOIN faculty_profiles f ON f.id = mc.faculty_id";

    private final JdbcTemplate jdbc;

    public ExamRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Exam> exams() {
        return jdbc.query("SELECT * FROM exams ORDER BY start_date DESC", EXAM_MAPPER).stream()
                .map(this::withSubjects)
                .toList();
    }

    public Optional<Exam> examById(String id) {
        return jdbc.query("SELECT * FROM exams WHERE id = ?", EXAM_MAPPER, id)
                .stream().findFirst().map(this::withSubjects);
    }

    public List<ExamSubjectView> examSubjects(String examId) {
        return jdbc.query("SELECT es.id, es.exam_id, es.subject_id, s.code AS subject_code,"
                        + " s.name AS subject_name, s.credits, es.exam_date, es.max_marks, es.pass_marks"
                        + " FROM exam_subjects es JOIN subjects s ON s.id = es.subject_id"
                        + " WHERE es.exam_id = ? ORDER BY es.exam_date, s.code",
                EXAM_SUBJECT_MAPPER, examId);
    }

    public Optional<ExamSubjectView> examSubject(String examId, String subjectId) {
        return jdbc.query("SELECT es.id, es.exam_id, es.subject_id, s.code AS subject_code,"
                        + " s.name AS subject_name, s.credits, es.exam_date, es.max_marks, es.pass_marks"
                        + " FROM exam_subjects es JOIN subjects s ON s.id = es.subject_id"
                        + " WHERE es.exam_id = ? AND es.subject_id = ?",
                EXAM_SUBJECT_MAPPER, examId, subjectId).stream().findFirst();
    }

    public List<GradeRule> gradeRules() {
        return jdbc.query("SELECT * FROM grade_rules ORDER BY min_percentage DESC", GRADE_MAPPER);
    }

    public List<MarkView> marks(String examId, String subjectId) {
        return jdbc.query(MARK_SQL + " WHERE m.exam_id = ? AND m.subject_id = ? ORDER BY sp.register_number",
                MARK_MAPPER, examId, subjectId);
    }

    public List<MarkView> marksForExam(String examId) {
        return jdbc.query(MARK_SQL + " WHERE m.exam_id = ? ORDER BY sp.register_number",
                MARK_MAPPER, examId);
    }

    public List<MarkView> marksForStudent(String examId, String studentId) {
        return jdbc.query(MARK_SQL + " WHERE m.exam_id = ? AND m.student_id = ? ORDER BY m.subject_id",
                MARK_MAPPER, examId, studentId);
    }

    public Optional<MarkView> mark(String examId, String subjectId, String studentId) {
        return jdbc.query(MARK_SQL + " WHERE m.exam_id = ? AND m.subject_id = ? AND m.student_id = ?",
                MARK_MAPPER, examId, subjectId, studentId).stream().findFirst();
    }

    public void upsertMark(MarkView mark) {
        jdbc.update("INSERT INTO student_marks (id, exam_id, subject_id, student_id, status, marks_obtained,"
                        + " grade, grade_point, is_passed, entered_by_faculty_id, last_updated)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                        + " ON DUPLICATE KEY UPDATE status = VALUES(status),"
                        + " marks_obtained = VALUES(marks_obtained), grade = VALUES(grade),"
                        + " grade_point = VALUES(grade_point), is_passed = VALUES(is_passed),"
                        + " entered_by_faculty_id = VALUES(entered_by_faculty_id), last_updated = VALUES(last_updated)",
                mark.id(), mark.examId(), mark.subjectId(), mark.studentId(), mark.status(),
                mark.marksObtained(), mark.grade(), mark.gradePoint(), mark.passed(),
                mark.enteredByFacultyId(), mark.lastUpdated());
    }

    public int countMarks(String examId, String subjectId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM student_marks"
                + " WHERE exam_id = ? AND subject_id = ?", Integer.class, examId, subjectId);
        return count == null ? 0 : count;
    }

    public void updateExamStatus(String examId, String status, LocalDateTime publishedAt, String publishedBy) {
        jdbc.update("UPDATE exams SET status = ?, published_at = ?, published_by = ? WHERE id = ?",
                status, publishedAt, publishedBy, examId);
    }

    public void deleteResult(String studentId, String examId) {
        jdbc.update("DELETE FROM semester_results WHERE student_id = ? AND exam_id = ?", studentId, examId);
    }

    public void insertResult(SemesterResult result) {
        jdbc.update("INSERT INTO semester_results (id, student_id, exam_id, semester, academic_year,"
                        + " total_credits, earned_credits, semester_gpa, overall_cgpa, overall_result, published_at)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                result.id(), result.studentId(), result.examId(), result.semester(), result.academicYear(),
                result.totalCredits(), result.earnedCredits(), result.semesterGpa(), result.overallCgpa(),
                result.overallResult(), result.publishedAt());
        for (ResultSubject subject : result.subjects()) {
            jdbc.update("INSERT INTO semester_result_subjects (id, result_id, subject_id, subject_code,"
                            + " subject_name, credits, max_marks, marks_obtained, status, grade, grade_point, is_passed)"
                            + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    subject.id(), result.id(), subject.subjectId(), subject.subjectCode(), subject.subjectName(),
                    subject.credits(), subject.maxMarks(), subject.marksObtained(), subject.status(),
                    subject.grade(), subject.gradePoint(), subject.passed());
        }
    }

    public Optional<SemesterResult> result(String studentId, String examId) {
        return jdbc.query(RESULT_SQL + " WHERE r.student_id = ? AND r.exam_id = ?",
                RESULT_MAPPER, studentId, examId).stream().findFirst().map(this::withResultSubjects);
    }

    public List<SemesterResult> resultsForStudent(String studentId) {
        return jdbc.query(RESULT_SQL + " WHERE r.student_id = ? ORDER BY r.semester",
                RESULT_MAPPER, studentId).stream().map(this::withResultSubjects).toList();
    }

    public List<SemesterResult> resultsForExam(String examId) {
        return jdbc.query(RESULT_SQL + " WHERE r.exam_id = ? ORDER BY sp.register_number",
                RESULT_MAPPER, examId).stream().map(this::withResultSubjects).toList();
    }

    public List<SemesterResult> allResults() {
        return jdbc.query(RESULT_SQL + " ORDER BY r.academic_year DESC, r.semester DESC, sp.register_number",
                RESULT_MAPPER).stream().map(this::withResultSubjects).toList();
    }

    public List<ResultSubject> resultSubjects(String resultId) {
        return jdbc.query("SELECT * FROM semester_result_subjects WHERE result_id = ? ORDER BY subject_code",
                RESULT_SUBJECT_MAPPER, resultId);
    }

    public void updateCgpaForStudent(String studentId, BigDecimal cgpa) {
        jdbc.update("UPDATE semester_results SET overall_cgpa = ? WHERE student_id = ?", cgpa, studentId);
    }

    public List<ArrearRecord> arrearsForStudent(String studentId) {
        return jdbc.query("SELECT a.*, s.code AS subject_code, s.name AS subject_name"
                        + " FROM arrear_records a JOIN subjects s ON s.id = a.subject_id"
                        + " WHERE a.student_id = ? ORDER BY a.status, s.code",
                ARREAR_MAPPER, studentId);
    }

    public List<ArrearRecord> allArrears() {
        return jdbc.query("SELECT a.*, s.code AS subject_code, s.name AS subject_name"
                        + " FROM arrear_records a JOIN subjects s ON s.id = a.subject_id"
                        + " ORDER BY a.status, s.code",
                ARREAR_MAPPER);
    }

    public Optional<ArrearRecord> arrear(String studentId, String subjectId, String originalExamId) {
        return jdbc.query("SELECT a.*, s.code AS subject_code, s.name AS subject_name"
                        + " FROM arrear_records a JOIN subjects s ON s.id = a.subject_id"
                        + " WHERE a.student_id = ? AND a.subject_id = ? AND a.original_exam_id = ?",
                ARREAR_MAPPER, studentId, subjectId, originalExamId).stream().findFirst();
    }

    public Optional<ArrearRecord> registeredArrearForSubject(String studentId, String subjectId) {
        return jdbc.query("SELECT a.*, s.code AS subject_code, s.name AS subject_name"
                        + " FROM arrear_records a JOIN subjects s ON s.id = a.subject_id"
                        + " WHERE a.student_id = ? AND a.subject_id = ? AND a.status = 'REGISTERED'"
                        + " ORDER BY a.id LIMIT 1",
                ARREAR_MAPPER, studentId, subjectId).stream().findFirst();
    }

    public void insertArrear(String id, String studentId, String subjectId, String originalExamId, String originalGrade) {
        jdbc.update("INSERT INTO arrear_records (id, student_id, subject_id, original_exam_id, original_grade,"
                        + " cleared_in_exam_id, cleared_grade, status) VALUES (?, ?, ?, ?, ?, NULL, NULL, 'REGISTERED')",
                id, studentId, subjectId, originalExamId, originalGrade);
    }

    public void clearArrear(String arrearId, String clearedInExamId, String clearedGrade) {
        jdbc.update("UPDATE arrear_records SET cleared_in_exam_id = ?, cleared_grade = ?, status = 'CLEARED'"
                + " WHERE id = ?", clearedInExamId, clearedGrade, arrearId);
    }

    public List<MarksCorrection> marksCorrections(String role, String userId, String status) {
        StringBuilder sql = new StringBuilder(CORRECTION_SQL + " WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if ("FACULTY".equals(role)) {
            sql.append(" AND f.user_id = ?");
            params.add(userId);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND mc.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY mc.submitted_at DESC");
        return jdbc.query(sql.toString(), CORRECTION_MAPPER, params.toArray());
    }

    public Optional<MarksCorrection> marksCorrection(String id) {
        return jdbc.query(CORRECTION_SQL + " WHERE mc.id = ?", CORRECTION_MAPPER, id).stream().findFirst();
    }

    public boolean hasPendingMarksCorrection(String examId, String subjectId, String studentId) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM marks_correction_requests"
                        + " WHERE exam_id = ? AND subject_id = ? AND student_id = ? AND status = 'PENDING'",
                Long.class, examId, subjectId, studentId);
        return count != null && count > 0;
    }

    public void insertMarksCorrection(MarksCorrection correction) {
        jdbc.update("INSERT INTO marks_correction_requests (id, exam_id, subject_id, student_id, faculty_id,"
                        + " old_marks, new_marks, old_status, new_status, reason, status, submitted_at,"
                        + " reviewed_by_admin_id, reviewed_at, review_notes)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)",
                correction.id(), correction.examId(), correction.subjectId(), correction.studentId(),
                correction.facultyId(), correction.oldMarks(), correction.newMarks(), correction.oldStatus(),
                correction.newStatus(), correction.reason(), correction.status(), correction.submittedAt());
    }

    public void reviewMarksCorrection(String id, String status, String reviewedBy,
                                      LocalDateTime reviewedAt, String notes) {
        jdbc.update("UPDATE marks_correction_requests SET status = ?, reviewed_by_admin_id = ?,"
                        + " reviewed_at = ?, review_notes = ? WHERE id = ?",
                status, reviewedBy, reviewedAt, notes, id);
    }

    public String examPublishedBy(String examId) {
        return jdbc.queryForObject("SELECT published_by FROM exams WHERE id = ?", String.class, examId);
    }

    private Exam withSubjects(Exam exam) {
        return new Exam(exam.id(), exam.name(), exam.code(), exam.academicYear(), exam.semester(),
                exam.startDate(), exam.endDate(), exam.status(), exam.publishedAt(), exam.publishedBy(),
                examSubjects(exam.id()));
    }

    private SemesterResult withResultSubjects(SemesterResult result) {
        return result.withSubjects(resultSubjects(result.id()));
    }
}
