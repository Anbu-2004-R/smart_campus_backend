package com.smartcampus.erp.announcement;

import com.smartcampus.erp.common.Sql;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AnnouncementRepository {
    private static final RowMapper<Announcement> MAPPER = (rs, rowNum) -> new Announcement(
            rs.getString("id"),
            rs.getString("title"),
            rs.getString("content"),
            rs.getString("author_id"),
            rs.getString("author_name"),
            rs.getString("scope"),
            rs.getString("target_department_id"),
            rs.getString("target_course_id"),
            rs.getObject("target_semester") == null ? null : rs.getInt("target_semester"),
            rs.getString("priority"),
            Sql.dateTime(rs, "published_at"),
            Sql.date(rs, "expiry_date"));

    private final JdbcTemplate jdbc;

    public AnnouncementRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Announcement> list(boolean adminView, String departmentId,
                                   String courseId, Integer semester, LocalDate today) {
        StringBuilder sql = new StringBuilder("SELECT * FROM announcements"
                + " WHERE (expiry_date IS NULL OR expiry_date >= ?)");
        List<Object> params = new ArrayList<>();
        params.add(today);
        if (!adminView) {
            sql.append(" AND (scope = 'COLLEGE_WIDE'");
            if (departmentId != null) {
                sql.append(" OR (scope = 'DEPARTMENT' AND target_department_id = ?)");
                params.add(departmentId);
            }
            if (courseId != null) {
                sql.append(" OR (scope = 'COURSE' AND target_course_id = ?)");
                params.add(courseId);
            }
            if (semester != null) {
                sql.append(" OR (scope = 'SEMESTER' AND target_semester = ?)");
                params.add(semester);
            }
            sql.append(")");
        }
        sql.append(" ORDER BY FIELD(priority, 'URGENT','NORMAL'), published_at DESC");
        return jdbc.query(sql.toString(), MAPPER, params.toArray());
    }

    public Optional<Announcement> findById(String id) {
        return jdbc.query("SELECT * FROM announcements WHERE id = ?", MAPPER, id).stream().findFirst();
    }

    public void insert(Announcement announcement) {
        jdbc.update("INSERT INTO announcements (id, title, content, author_id, author_name, scope,"
                        + " target_department_id, target_course_id, target_semester, priority, published_at,"
                        + " expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                announcement.id(), announcement.title(), announcement.content(), announcement.authorId(),
                announcement.authorName(), announcement.scope(), announcement.targetDepartmentId(),
                announcement.targetCourseId(), announcement.targetSemester(), announcement.priority(),
                announcement.publishedAt(), announcement.expiryDate());
    }

    public void delete(String id) {
        jdbc.update("DELETE FROM announcements WHERE id = ?", id);
    }

    public long countActive(LocalDate today) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM announcements"
                + " WHERE (expiry_date IS NULL OR expiry_date >= ?)", Long.class, today);
        return value == null ? 0 : value;
    }
}
