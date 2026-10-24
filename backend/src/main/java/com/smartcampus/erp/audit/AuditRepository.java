package com.smartcampus.erp.audit;

import com.smartcampus.erp.common.Sql;
import java.util.ArrayList;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AuditRepository {
    private static final RowMapper<AuditLog> MAPPER = (rs, rowNum) -> new AuditLog(
            rs.getString("id"),
            rs.getString("actor_user_id"),
            rs.getString("actor_name"),
            rs.getString("actor_role"),
            rs.getString("action"),
            rs.getString("entity_type"),
            rs.getString("entity_id"),
            rs.getString("details"),
            Sql.dateTime(rs, "timestamp"),
            rs.getString("ip_address"));

    private final JdbcTemplate jdbc;

    public AuditRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(AuditLog log) {
        jdbc.update("INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type,"
                        + " entity_id, details, timestamp, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                log.id(), log.actorUserId(), log.actorName(), log.actorRole(), log.action(),
                log.entityType(), log.entityId(), log.details(), log.timestamp(), log.ipAddress());
    }

    public List<AuditLog> find(String actorUserId, String entityType, String action, int limit) {
        StringBuilder sql = new StringBuilder("SELECT * FROM audit_logs WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (actorUserId != null && !actorUserId.isBlank()) {
            sql.append(" AND actor_user_id = ?");
            params.add(actorUserId);
        }
        if (entityType != null && !entityType.isBlank()) {
            sql.append(" AND entity_type = ?");
            params.add(entityType);
        }
        if (action != null && !action.isBlank()) {
            sql.append(" AND action = ?");
            params.add(action);
        }
        sql.append(" ORDER BY timestamp DESC LIMIT ?");
        params.add(Math.max(1, Math.min(limit, 1000)));
        return jdbc.query(sql.toString(), MAPPER, params.toArray());
    }

    public List<AuditLog> recent(int limit) {
        return jdbc.query("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?",
                MAPPER, Math.max(1, Math.min(limit, 1000)));
    }
}
