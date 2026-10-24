package com.smartcampus.erp.complaint;

import com.smartcampus.erp.common.Sql;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ComplaintRepository {
    private static final RowMapper<Complaint> MAPPER = (rs, rowNum) -> new Complaint(
            rs.getString("id"),
            rs.getString("ticket_number"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getString("category"),
            rs.getString("requested_priority"),
            rs.getString("official_priority"),
            rs.getString("status"),
            rs.getString("submitted_by_user_id"),
            rs.getString("submitter_name"),
            rs.getString("submitter_role"),
            rs.getString("submitter_email"),
            rs.getString("assigned_to_faculty_id"),
            rs.getString("assigned_faculty_name"),
            Sql.dateTime(rs, "submitted_at"),
            Sql.dateTime(rs, "updated_at"),
            rs.getString("resolution_notes"),
            rs.getString("rejection_reason"),
            List.of());

    private static final RowMapper<ComplaintTimeline> TIMELINE_MAPPER = (rs, rowNum) -> new ComplaintTimeline(
            rs.getString("id"),
            rs.getString("complaint_id"),
            rs.getString("status"),
            Sql.dateTime(rs, "timestamp"),
            rs.getString("changed_by"),
            rs.getString("notes"));

    private final JdbcTemplate jdbc;

    public ComplaintRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Complaint> list(String role, String userId, String status,
                                String category, String priority) {
        StringBuilder sql = new StringBuilder("SELECT * FROM complaints WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if ("STUDENT".equals(role)) {
            sql.append(" AND submitted_by_user_id = ?");
            params.add(userId);
        } else if ("FACULTY".equals(role)) {
            sql.append(" AND (submitted_by_user_id = ? OR assigned_to_faculty_id ="
                    + " (SELECT id FROM faculty_profiles WHERE user_id = ?))");
            params.add(userId);
            params.add(userId);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ?");
            params.add(status);
        }
        if (category != null && !category.isBlank()) {
            sql.append(" AND category = ?");
            params.add(category);
        }
        if (priority != null && !priority.isBlank()) {
            sql.append(" AND official_priority = ?");
            params.add(priority);
        }
        sql.append(" ORDER BY FIELD(official_priority, 'URGENT','HIGH','MEDIUM','LOW'), submitted_at DESC");
        return jdbc.query(sql.toString(), MAPPER, params.toArray()).stream()
                .map(complaint -> complaint.withTimeline(timeline(complaint.id())))
                .toList();
    }

    public Optional<Complaint> complaint(String id) {
        return jdbc.query("SELECT * FROM complaints WHERE id = ?", MAPPER, id)
                .stream().findFirst()
                .map(complaint -> complaint.withTimeline(timeline(complaint.id())));
    }

    public List<ComplaintTimeline> timeline(String complaintId) {
        return jdbc.query("SELECT * FROM complaint_timeline WHERE complaint_id = ? ORDER BY timestamp",
                TIMELINE_MAPPER, complaintId);
    }

    public void insert(Complaint complaint) {
        jdbc.update("INSERT INTO complaints (id, ticket_number, title, description, category,"
                        + " requested_priority, official_priority, status, submitted_by_user_id, submitter_name,"
                        + " submitter_role, submitter_email, assigned_to_faculty_id, assigned_faculty_name,"
                        + " submitted_at, updated_at, resolution_notes, rejection_reason)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                complaint.id(), complaint.ticketNumber(), complaint.title(), complaint.description(),
                complaint.category(), complaint.requestedPriority(), complaint.officialPriority(),
                complaint.status(), complaint.submittedByUserId(), complaint.submitterName(),
                complaint.submitterRole(), complaint.submitterEmail(), complaint.assignedToFacultyId(),
                complaint.assignedFacultyName(), complaint.submittedAt(), complaint.updatedAt(),
                complaint.resolutionNotes(), complaint.rejectionReason());
    }

    public void insertTimeline(ComplaintTimeline timeline) {
        jdbc.update("INSERT INTO complaint_timeline (id, complaint_id, status, timestamp, changed_by, notes)"
                        + " VALUES (?, ?, ?, ?, ?, ?)",
                timeline.id(), timeline.complaintId(), timeline.status(), timeline.timestamp(),
                timeline.changedBy(), timeline.notes());
    }

    public void updateStatus(String id, String status, String resolutionNotes,
                             String rejectionReason, LocalDateTime updatedAt) {
        jdbc.update("UPDATE complaints SET status = ?, resolution_notes = ?, rejection_reason = ?,"
                        + " updated_at = ? WHERE id = ?",
                status, resolutionNotes, rejectionReason, updatedAt, id);
    }

    public void updatePriority(String id, String priority, LocalDateTime updatedAt) {
        jdbc.update("UPDATE complaints SET official_priority = ?, updated_at = ? WHERE id = ?",
                priority, updatedAt, id);
    }

    public void assign(String id, String facultyId, String facultyName, String status,
                       LocalDateTime updatedAt) {
        jdbc.update("UPDATE complaints SET assigned_to_faculty_id = ?, assigned_faculty_name = ?,"
                        + " status = ?, updated_at = ? WHERE id = ?",
                facultyId, facultyName, status, updatedAt, id);
    }

    public String nextTicketNumber(String prefix) {
        Integer max = jdbc.queryForObject("SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number, ?) AS UNSIGNED)), 100)"
                        + " FROM complaints WHERE ticket_number LIKE ?",
                Integer.class, prefix.length() + 1, prefix + "%");
        int sequence = (max == null ? 100 : max) + 1;
        String candidate = prefix + String.format("%04d", sequence);
        while (existsTicket(candidate)) {
            sequence++;
            candidate = prefix + String.format("%04d", sequence);
        }
        return candidate;
    }

    private boolean existsTicket(String ticketNumber) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM complaints WHERE ticket_number = ?",
                Long.class, ticketNumber);
        return count != null && count > 0;
    }
}
