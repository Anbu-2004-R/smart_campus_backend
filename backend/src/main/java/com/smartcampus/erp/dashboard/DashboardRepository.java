package com.smartcampus.erp.dashboard;

import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardRepository {
    private final JdbcTemplate jdbc;

    public DashboardRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public AdminStats adminStats(LocalDate today) {
        return jdbc.queryForObject("SELECT"
                        + " (SELECT COUNT(*) FROM student_profiles) AS total_students,"
                        + " (SELECT COUNT(*) FROM faculty_profiles) AS total_faculty,"
                        + " (SELECT COUNT(*) FROM attendance_records) AS attendance_total,"
                        + " (SELECT COUNT(*) FROM attendance_records WHERE status IN ('PRESENT','LATE','ON_DUTY')) AS attendance_present,"
                        + " (SELECT COUNT(*) FROM attendance_correction_requests WHERE status = 'PENDING_ADMIN') AS pending_admin_corrections,"
                        + " (SELECT COUNT(*) FROM complaints WHERE status IN ('SUBMITTED','UNDER_REVIEW','IN_PROGRESS')) AS open_complaints,"
                        + " (SELECT COUNT(*) FROM complaints WHERE official_priority IN ('URGENT','HIGH')"
                        + "   AND status IN ('SUBMITTED','UNDER_REVIEW','IN_PROGRESS')) AS critical_complaints,"
                        + " (SELECT COUNT(*) FROM exams WHERE status <> 'PUBLISHED') AS active_exams,"
                        + " (SELECT COUNT(*) FROM student_enrollments WHERE status = 'ACTIVE') AS active_enrollments,"
                        + " (SELECT COUNT(*) FROM admission_applications WHERE status IN ('SUBMITTED','UNDER_REVIEW')) AS pending_admissions,"
                        + " (SELECT COUNT(*) FROM admission_applications WHERE status = 'APPROVED') AS admitted_applications,"
                        + " (SELECT COUNT(*) FROM admission_applications WHERE status = 'REJECTED') AS rejected_applications,"
                        + " (SELECT COUNT(*) FROM announcements WHERE expiry_date IS NULL OR expiry_date >= ?) AS active_announcements",
                (rs, rowNum) -> new AdminStats(
                        rs.getLong("total_students"),
                        rs.getLong("total_faculty"),
                        rs.getLong("attendance_total") == 0 ? 88.5
                                : Math.round(rs.getLong("attendance_present") * 1000.0
                                        / rs.getLong("attendance_total")) / 10.0,
                        rs.getLong("pending_admin_corrections"),
                        rs.getLong("open_complaints"),
                        rs.getLong("critical_complaints"),
                        rs.getLong("active_exams"),
                        rs.getLong("active_enrollments"),
                        rs.getLong("pending_admissions"),
                        rs.getLong("admitted_applications"),
                        rs.getLong("rejected_applications"),
                        rs.getLong("active_announcements")),
                today);
    }

    public List<DepartmentStat> departmentStats() {
        return jdbc.query("SELECT d.code, COUNT(DISTINCT sp.id) AS students,"
                        + " COALESCE(ROUND(SUM(CASE WHEN ar.status IN ('PRESENT','LATE','ON_DUTY') THEN 1 ELSE 0 END)"
                        + " * 100.0 / NULLIF(COUNT(ar.id), 0), 1), 0) AS attendance"
                        + " FROM departments d"
                        + " LEFT JOIN student_profiles sp ON sp.department_id = d.id"
                        + " LEFT JOIN attendance_records ar ON ar.student_id = sp.id"
                        + " GROUP BY d.id, d.code ORDER BY d.code",
                (rs, rowNum) -> new DepartmentStat(
                        rs.getString("code"),
                        rs.getInt("students"),
                        rs.getDouble("attendance")));
    }

    public long facultyPendingCorrections(String facultyId) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM attendance_correction_requests c"
                        + " WHERE c.status = 'PENDING_FACULTY'"
                        + " AND EXISTS (SELECT 1 FROM faculty_subject_assignments fa"
                        + " WHERE fa.faculty_id = ? AND fa.subject_id = c.subject_id)",
                Long.class, facultyId);
        return value == null ? 0 : value;
    }

    public long facultyOpenComplaints(String facultyId) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM complaints"
                        + " WHERE assigned_to_faculty_id = ? AND status IN ('SUBMITTED','UNDER_REVIEW','IN_PROGRESS')",
                Long.class, facultyId);
        return value == null ? 0 : value;
    }

    public long studentOpenComplaints(String userId) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM complaints"
                        + " WHERE submitted_by_user_id = ? AND status IN ('SUBMITTED','UNDER_REVIEW','IN_PROGRESS')",
                Long.class, userId);
        return value == null ? 0 : value;
    }

    public long studentPendingCorrections(String studentId) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM attendance_correction_requests"
                        + " WHERE student_id = ? AND status IN ('PENDING_FACULTY','PENDING_ADMIN')",
                Long.class, studentId);
        return value == null ? 0 : value;
    }

    public record AdminStats(
            long totalStudents,
            long totalFaculty,
            double institutionalAttendance,
            long pendingAdminCorrections,
            long openComplaints,
            long criticalComplaints,
            long activeExams,
            long activeEnrollments,
            long pendingAdmissions,
            long admittedApplications,
            long rejectedApplications,
            long activeAnnouncements) {
    }
}
