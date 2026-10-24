package com.smartcampus.erp.user;

import com.smartcampus.erp.common.Sql;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private static final String COLUMNS =
            "id, login_id, email, password_hash, role, status, created_at, last_login, avatar_url";

    private static final RowMapper<UserAccount> MAPPER = (rs, rowNum) -> new UserAccount(
            rs.getString("id"),
            rs.getString("login_id"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("status"),
            Sql.dateTime(rs, "created_at"),
            Sql.dateTime(rs, "last_login"),
            rs.getString("avatar_url"));

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<UserAccount> findById(String id) {
        return jdbc.query("SELECT " + COLUMNS + " FROM users WHERE id = ?", MAPPER, id)
                .stream().findFirst();
    }

    public Optional<UserAccount> findByLoginIdOrEmail(String loginId) {
        return jdbc.query("SELECT " + COLUMNS
                        + " FROM users WHERE LOWER(login_id) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1",
                MAPPER, loginId, loginId).stream().findFirst();
    }

    public List<User> findAll(String role, String status, String query) {
        StringBuilder sql = new StringBuilder("SELECT " + COLUMNS + " FROM users WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (role != null && !role.isBlank()) {
            sql.append(" AND role = ?");
            params.add(role);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ?");
            params.add(status);
        }
        if (query != null && !query.isBlank()) {
            sql.append(" AND (LOWER(login_id) LIKE ? OR LOWER(email) LIKE ? OR LOWER(role) LIKE ?)");
            String like = "%" + query.toLowerCase() + "%";
            params.add(like);
            params.add(like);
            params.add(like);
        }
        sql.append(" ORDER BY created_at DESC");
        return jdbc.query(sql.toString(), MAPPER, params.toArray())
                .stream().map(User::from).toList();
    }

    public void updateLastLogin(String id, LocalDateTime timestamp) {
        jdbc.update("UPDATE users SET last_login = ? WHERE id = ?", timestamp, id);
    }

    public void updateStatus(String id, String status) {
        jdbc.update("UPDATE users SET status = ? WHERE id = ?", status, id);
    }

    public void updatePassword(String id, String passwordHash) {
        jdbc.update("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, id);
    }

    public boolean existsByLoginIdOrEmail(String loginId, String email) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(login_id) = LOWER(?) OR LOWER(email) = LOWER(?)",
                Integer.class, loginId, email);
        return count != null && count > 0;
    }

    public boolean existsByLoginId(String loginId) {
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(login_id) = LOWER(?)", Long.class, loginId);
        return count != null && count > 0;
    }

    public boolean existsByEmail(String email) {
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)", Long.class, email);
        return count != null && count > 0;
    }

    public void insert(UserAccount account) {
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO users (id, login_id, email, password_hash, role, status, created_at, last_login, avatar_url)"
                            + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.NO_GENERATED_KEYS);
            ps.setString(1, account.id());
            ps.setString(2, account.loginId());
            ps.setString(3, account.email());
            ps.setString(4, account.passwordHash());
            ps.setString(5, account.role());
            ps.setString(6, account.status());
            ps.setTimestamp(7, account.createdAt() == null ? null : Timestamp.valueOf(account.createdAt()));
            ps.setTimestamp(8, account.lastLogin() == null ? null : Timestamp.valueOf(account.lastLogin()));
            ps.setString(9, account.avatarUrl());
            return ps;
        });
    }

    public long countByRole(String role) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE role = ?", Long.class, role);
        return value == null ? 0 : value;
    }

    public long count() {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM users", Long.class);
        return value == null ? 0 : value;
    }
}
