package com.smartcampus.erp.notification;

import com.smartcampus.erp.common.Sql;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class NotificationRepository {
    private static final RowMapper<Notification> MAPPER = (rs, rowNum) -> new Notification(
            rs.getString("id"),
            rs.getString("recipient_user_id"),
            rs.getString("title"),
            rs.getString("message"),
            rs.getString("category"),
            rs.getString("reference_id"),
            rs.getBoolean("is_read"),
            Sql.dateTime(rs, "created_at"));

    private final JdbcTemplate jdbc;

    public NotificationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(Notification notification) {
        jdbc.update("INSERT INTO notifications (id, recipient_user_id, title, message, category, reference_id,"
                        + " is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                notification.id(), notification.recipientUserId(), notification.title(), notification.message(),
                notification.category(), notification.referenceId(), notification.read(), notification.createdAt());
    }

    public boolean existsRecent(String recipientUserId, String category, String referenceId, int minutes) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE recipient_user_id = ?"
                        + " AND category = ? AND reference_id <=> ? AND created_at >= ?",
                Long.class, recipientUserId, category, referenceId,
                LocalDateTime.now().minusMinutes(minutes));
        return count != null && count > 0;
    }

    public List<Notification> findForUser(String userId, boolean unreadOnly) {
        String sql = "SELECT * FROM notifications WHERE recipient_user_id = ?"
                + (unreadOnly ? " AND is_read = 0" : "")
                + " ORDER BY created_at DESC LIMIT 200";
        return jdbc.query(sql, MAPPER, userId);
    }

    public void markRead(String id, String userId) {
        jdbc.update("UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_user_id = ?", id, userId);
    }

    public void markAllRead(String userId) {
        jdbc.update("UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ?", userId);
    }

    public long countUnread(String userId) {
        Long value = jdbc.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE recipient_user_id = ? AND is_read = 0",
                Long.class, userId);
        return value == null ? 0 : value;
    }
}
