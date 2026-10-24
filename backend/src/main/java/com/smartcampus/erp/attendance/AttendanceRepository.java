package com.smartcampus.erp.attendance;

import com.smartcampus.erp.common.Sql;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AttendanceRepository {
    private static final RowMapper<ClassSession> SESSION_MAPPER = (rs, rowNum) -> new ClassSession(
            rs.getString("id"),
            rs.getString("assignment_id"),
            rs.getString("subject_id"),
            rs.getString("class_group_id"),
            rs.getString("faculty_id"),
            Sql.date(rs, "session_date"),
            rs.getInt("period"),
            rs.getString("room_number"),
            rs.getString("topic_covered"),
            Sql.dateTime(rs, "marked_at"));

    private static final RowMapper<SessionView> SESSION_VIEW_MAPPER = (rs, rowNum) -> new SessionView(
            rs.getString("id"),
            rs.getString("assignment_id"),
            rs.getString("subject_id"),
            rs.getString("subject_code"),
            rs.getString("subject_name"),
            rs.getString("class_group_id"),
            rs.getString("class_group_name"),
            rs.getString("faculty_id"),
            rs.getString("faculty_name"),
            Sql.date(rs, "session_date"),
            rs.getInt("period"),
            rs.getString("room_number"),
            rs.getString("topic_covered"),
            Sql.dateTime(rs, "marked_at"),
            List.of());

    private static final RowMapper<AttendanceRecordView> RECORD_VIEW_MAPPER = (rs, rowNum) -> new AttendanceRecordView(
            rs.getString("id"),
            rs.getString("student_id"),
            rs.getString("register_number"),
            rs.getString("full_name"),
            rs.getString("status"),
            rs.getString("remarks"));

    private static final RowMapper<AttendanceRecord> RECORD_MAPPER = (rs, rowNum) -> new AttendanceRecord(
            rs.getString("id"),
            rs.getString("session_id"),
            rs.getString("student_id"),
            rs.getString("status"),
            rs.getString("remarks"));

    private static final RowMapper<CorrectionRequest> CORRECTION_MAPPER = (rs, rowNum) -> new CorrectionRequest(
            rs.getString("id"),
            rs.getString("student_id"),
            rs.getString("student_name"),
            rs.getString("register_number"),
            rs.getString("session_id"),
            rs.getString("subject_id"),
            rs.getString("subject_code"),
            rs.getString("subject_name"),
            Sql.date(rs, "session_date"),
            rs.getString("original_status"),
            rs.getString("requested_status"),
            rs.getString("reason"),
            rs.getString("evidence_note"),
            rs.getString("status"),
            rs.getBoolean("is_eligible_for_faculty"),
            Sql.dateTime(rs, "submitted_at"),
            rs.getString("reviewed_by"),
            rs.getString("reviewer_role"),
            Sql.dateTime(rs, "reviewed_at"),
            rs.getString("review_remarks"));

    private static final RowMapper<RiskSettings> RISK_MAPPER = (rs, rowNum) -> new RiskSettings(
            rs.getString("id"),
            rs.getBigDecimal("high_risk_threshold"),
            rs.getBigDecimal("medium_risk_threshold"),
            rs.getInt("recent_absence_trend_days"),
            rs.getInt("warning_consecutive_absences"));

    private static final String SESSION_VIEW_SQL = "SELECT cs.id, cs.assignment_id, cs.subject_id,"
            + " s.code AS subject_code, s.name AS subject_name, cs.class_group_id,"
            + " cg.name AS class_group_name, cs.faculty_id, f.full_name AS faculty_name,"
            + " cs.session_date, cs.period, cs.room_number, cs.topic_covered, cs.marked_at"
            + " FROM class_sessions cs"
            + " JOIN subjects s ON s.id = cs.subject_id"
            + " JOIN class_groups cg ON cg.id = cs.class_group_id"
            + " JOIN faculty_profiles f ON f.id = cs.faculty_id";

    private static final String CORRECTION_SQL = "SELECT c.*, sp.full_name AS student_name,"
            + " sp.register_number, s.code AS subject_code, s.name AS subject_name"
            + " FROM attendance_correction_requests c"
            + " JOIN student_profiles sp ON sp.id = c.student_id"
            + " JOIN subjects s ON s.id = c.subject_id";

    private final JdbcTemplate jdbc;

    public AttendanceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public RiskSettings riskSettings() {
        return jdbc.query("SELECT * FROM attendance_risk_settings WHERE id = 'default'", RISK_MAPPER)
                .stream().findFirst()
                .orElse(new RiskSettings("default", new java.math.BigDecimal("75"),
                        new java.math.BigDecimal("80"), 14, 3));
    }

    public void updateRiskSettings(RiskSettings settings) {
        jdbc.update("UPDATE attendance_risk_settings SET high_risk_threshold = ?, medium_risk_threshold = ?,"
                        + " recent_absence_trend_days = ?, warning_consecutive_absences = ? WHERE id = 'default'",
                settings.highRiskThreshold(), settings.mediumRiskThreshold(),
                settings.recentAbsenceTrendDays(), settings.warningConsecutiveAbsences());
    }

    public List<ClassSession> sessions(String facultyId, String classGroupId, LocalDate from, LocalDate to) {
        StringBuilder sql = new StringBuilder("SELECT * FROM class_sessions WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (facultyId != null && !facultyId.isBlank()) {
            sql.append(" AND faculty_id = ?");
            params.add(facultyId);
        }
        if (classGroupId != null && !classGroupId.isBlank()) {
            sql.append(" AND class_group_id = ?");
            params.add(classGroupId);
        }
        if (from != null) {
            sql.append(" AND session_date >= ?");
            params.add(from);
        }
        if (to != null) {
            sql.append(" AND session_date <= ?");
            params.add(to);
        }
        sql.append(" ORDER BY session_date DESC, period DESC");
        return jdbc.query(sql.toString(), SESSION_MAPPER, params.toArray());
    }

    public List<SessionView> sessionViews(String facultyId, String classGroupId, LocalDate from, LocalDate to) {
        StringBuilder sql = new StringBuilder(SESSION_VIEW_SQL + " WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (facultyId != null && !facultyId.isBlank()) {
            sql.append(" AND cs.faculty_id = ?");
            params.add(facultyId);
        }
        if (classGroupId != null && !classGroupId.isBlank()) {
            sql.append(" AND cs.class_group_id = ?");
            params.add(classGroupId);
        }
        if (from != null) {
            sql.append(" AND cs.session_date >= ?");
            params.add(from);
        }
        if (to != null) {
            sql.append(" AND cs.session_date <= ?");
            params.add(to);
        }
        sql.append(" ORDER BY cs.session_date DESC, cs.period DESC");
        return jdbc.query(sql.toString(), SESSION_VIEW_MAPPER, params.toArray()).stream()
                .map(session -> session.withRecords(recordsForSession(session.id())))
                .toList();
    }

    public Optional<SessionView> sessionViewById(String id) {
        return jdbc.query(SESSION_VIEW_SQL + " WHERE cs.id = ?", SESSION_VIEW_MAPPER, id)
                .stream().findFirst()
                .map(session -> session.withRecords(recordsForSession(session.id())));
    }

    public Optional<ClassSession> sessionById(String id) {
        return jdbc.query("SELECT * FROM class_sessions WHERE id = ?", SESSION_MAPPER, id)
                .stream().findFirst();
    }

    public Optional<ClassSession> sessionFor(String assignmentId, LocalDate date, int period) {
        return jdbc.query("SELECT * FROM class_sessions WHERE assignment_id = ? AND session_date = ? AND period = ? LIMIT 1",
                SESSION_MAPPER, assignmentId, date, period).stream().findFirst();
    }

    public void insertSession(ClassSession session) {
        jdbc.update("INSERT INTO class_sessions (id, assignment_id, subject_id, class_group_id, faculty_id,"
                        + " session_date, period, room_number, topic_covered, marked_at)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                session.id(), session.assignmentId(), session.subjectId(), session.classGroupId(),
                session.facultyId(), session.date(), session.period(), session.roomNumber(),
                session.topicCovered(), session.markedAt());
    }

    public List<AttendanceRecordView> recordsForSession(String sessionId) {
        return jdbc.query("SELECT ar.id, ar.student_id, sp.register_number, sp.full_name, ar.status, ar.remarks"
                        + " FROM attendance_records ar JOIN student_profiles sp ON sp.id = ar.student_id"
                        + " WHERE ar.session_id = ? ORDER BY sp.register_number",
                RECORD_VIEW_MAPPER, sessionId);
    }

    public Optional<AttendanceRecord> recordFor(String sessionId, String studentId) {
        return jdbc.query("SELECT * FROM attendance_records WHERE session_id = ? AND student_id = ?",
                RECORD_MAPPER, sessionId, studentId).stream().findFirst();
    }

    public void insertRecord(AttendanceRecord record) {
        jdbc.update("INSERT INTO attendance_records (id, session_id, student_id, status, remarks)"
                        + " VALUES (?, ?, ?, ?, ?)",
                record.id(), record.sessionId(), record.studentId(), record.status(), record.remarks());
    }

    public void updateRecordStatus(String sessionId, String studentId, String status, String remarks) {
        jdbc.update("UPDATE attendance_records SET status = ?, remarks = ? WHERE session_id = ? AND student_id = ?",
                status, remarks, sessionId, studentId);
    }

    public List<CorrectionRequest> corrections(String role, String userId, String status) {
        StringBuilder sql = new StringBuilder(CORRECTION_SQL + " WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if ("STUDENT".equals(role)) {
            sql.append(" AND c.student_id = (SELECT id FROM student_profiles WHERE user_id = ?)");
            params.add(userId);
        } else if ("FACULTY".equals(role)) {
            sql.append(" AND EXISTS (SELECT 1 FROM faculty_subject_assignments fa"
                    + " JOIN faculty_profiles f ON f.id = fa.faculty_id"
                    + " WHERE fa.subject_id = c.subject_id AND f.user_id = ?)");
            params.add(userId);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND c.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY c.submitted_at DESC");
        return jdbc.query(sql.toString(), CORRECTION_MAPPER, params.toArray());
    }

    public Optional<CorrectionRequest> correctionById(String id) {
        return jdbc.query(CORRECTION_SQL + " WHERE c.id = ?", CORRECTION_MAPPER, id)
                .stream().findFirst();
    }

    public boolean hasPendingCorrection(String studentId, String sessionId) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM attendance_correction_requests"
                        + " WHERE student_id = ? AND session_id = ? AND status IN ('PENDING_FACULTY','PENDING_ADMIN')",
                Long.class, studentId, sessionId);
        return count != null && count > 0;
    }

    public void insertCorrection(CorrectionRequest request) {
        jdbc.update("INSERT INTO attendance_correction_requests (id, student_id, session_id, subject_id,"
                        + " session_date, original_status, requested_status, reason, evidence_note, status,"
                        + " is_eligible_for_faculty, submitted_at, reviewed_by, reviewer_role, reviewed_at, review_remarks)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                request.id(), request.studentId(), request.sessionId(), request.subjectId(),
                request.sessionDate(), request.originalStatus(), request.requestedStatus(),
                request.reason(), request.evidenceNote(), request.status(), request.eligibleForFaculty(),
                request.submittedAt(), request.reviewedBy(), request.reviewerRole(),
                request.reviewedAt(), request.reviewRemarks());
    }

    public void reviewCorrection(String id, String status, String reviewedBy, String reviewerRole,
                                 LocalDateTime reviewedAt, String reviewRemarks) {
        jdbc.update("UPDATE attendance_correction_requests SET status = ?, reviewed_by = ?, reviewer_role = ?,"
                        + " reviewed_at = ?, review_remarks = ? WHERE id = ?",
                status, reviewedBy, reviewerRole, reviewedAt, reviewRemarks, id);
    }

    public int[] overallCounts(String studentId) {
        Integer[] result = jdbc.queryForObject("SELECT COUNT(*) AS total,"
                        + " COALESCE(SUM(CASE WHEN ar.status IN ('PRESENT','LATE','ON_DUTY') THEN 1 ELSE 0 END), 0) AS attended"
                        + " FROM attendance_records ar WHERE ar.student_id = ?",
                (rs, rowNum) -> new Integer[]{rs.getInt("total"), rs.getInt("attended")}, studentId);
        return result == null ? new int[]{0, 0} : new int[]{result[0], result[1]};
    }

    public int recentAbsences(String studentId, LocalDate since) {
        Integer value = jdbc.queryForObject("SELECT COUNT(*) FROM attendance_records ar"
                        + " JOIN class_sessions cs ON cs.id = ar.session_id"
                        + " WHERE ar.student_id = ? AND ar.status = 'ABSENT' AND cs.session_date >= ?",
                Integer.class, studentId, since);
        return value == null ? 0 : value;
    }

    public List<SubjectAttendance> subjectStats(String studentId, String courseId,
                                                String classGroupId, int semester) {
        return jdbc.query("SELECT s.id AS subject_id, s.code AS subject_code, s.name AS subject_name,"
                        + " COUNT(ar.id) AS total,"
                        + " COALESCE(SUM(CASE WHEN ar.status IN ('PRESENT','LATE','ON_DUTY') THEN 1 ELSE 0 END), 0) AS attended"
                        + " FROM subjects s"
                        + " LEFT JOIN class_sessions cs ON cs.subject_id = s.id AND cs.class_group_id = ?"
                        + " LEFT JOIN attendance_records ar ON ar.session_id = cs.id AND ar.student_id = ?"
                        + " WHERE s.course_id = ? AND s.semester = ?"
                        + " GROUP BY s.id, s.code, s.name ORDER BY s.code",
                (rs, rowNum) -> {
                    int total = rs.getInt("total");
                    int attended = rs.getInt("attended");
                    double percentage = total > 0 ? Math.round((attended * 1000.0) / total) / 10.0 : 100.0;
                    return new SubjectAttendance(
                            rs.getString("subject_id"),
                            rs.getString("subject_code"),
                            rs.getString("subject_name"),
                            total,
                            attended,
                            percentage,
                            null);
                },
                classGroupId, studentId, courseId, semester);
    }

    public long countSessionsOn(String facultyId, LocalDate date) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM class_sessions WHERE faculty_id = ? AND session_date = ?",
                Long.class, facultyId, date);
        return value == null ? 0 : value;
    }

    public long countPendingCorrections(String status) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM attendance_correction_requests WHERE status = ?",
                Long.class, status);
        return value == null ? 0 : value;
    }
}
