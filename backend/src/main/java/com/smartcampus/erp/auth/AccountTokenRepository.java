package com.smartcampus.erp.auth;

import com.smartcampus.erp.common.Sql;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AccountTokenRepository {
    private static final RowMapper<AccountToken> MAPPER = (rs, rowNum) -> new AccountToken(
            rs.getString("id"),
            rs.getString("user_id"),
            rs.getString("token"),
            rs.getString("type"),
            Sql.dateTime(rs, "expires_at"),
            Sql.dateTime(rs, "used_at"));

    private final JdbcTemplate jdbc;

    public AccountTokenRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(AccountToken token) {
        jdbc.update("INSERT INTO account_tokens (id, user_id, token, type, expires_at, used_at)"
                        + " VALUES (?, ?, ?, ?, ?, ?)",
                token.id(), token.userId(), token.token(), token.type(), token.expiresAt(), token.usedAt());
    }

    public Optional<AccountToken> findUsable(String token) {
        return jdbc.query("SELECT * FROM account_tokens WHERE token = ? AND used_at IS NULL"
                        + " AND expires_at > ? LIMIT 1",
                MAPPER, token, LocalDateTime.now()).stream().findFirst();
    }

    public void markUsed(String id) {
        jdbc.update("UPDATE account_tokens SET used_at = ? WHERE id = ?", LocalDateTime.now(), id);
    }
}
