package com.smartcampus.erp.user;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class FacultyRepository {
    private static final String COLUMNS = "id, user_id, employee_id, full_name, department_id, email, phone, designation, avatar_url";

    private static final RowMapper<FacultyProfile> MAPPER = (rs, rowNum) -> new FacultyProfile(
            rs.getString("id"),
            rs.getString("user_id"),
            rs.getString("employee_id"),
            rs.getString("full_name"),
            rs.getString("department_id"),
            rs.getString("email"),
            rs.getString("phone"),
            rs.getString("designation"),
            rs.getString("avatar_url"));

    private final JdbcTemplate jdbc;

    public FacultyRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<FacultyProfile> findById(String id) {
        return jdbc.query("SELECT " + COLUMNS + " FROM faculty_profiles WHERE id = ?", MAPPER, id)
                .stream().findFirst();
    }

    public Optional<FacultyProfile> findByUserId(String userId) {
        return jdbc.query("SELECT " + COLUMNS + " FROM faculty_profiles WHERE user_id = ?", MAPPER, userId)
                .stream().findFirst();
    }

    public List<FacultyProfile> findAll() {
        return jdbc.query("SELECT " + COLUMNS + " FROM faculty_profiles ORDER BY full_name", MAPPER);
    }

    public boolean existsByEmployeeId(String employeeId) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM faculty_profiles"
                + " WHERE LOWER(employee_id) = LOWER(?)", Long.class, employeeId);
        return count != null && count > 0;
    }

    public void insert(FacultyProfile profile) {
        jdbc.update("INSERT INTO faculty_profiles (id, user_id, employee_id, full_name, department_id,"
                        + " email, phone, designation, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                profile.id(), profile.userId(), profile.employeeId(), profile.fullName(),
                profile.departmentId(), profile.email(), profile.phone(), profile.designation(),
                profile.avatarUrl());
    }

    public long count() {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM faculty_profiles", Long.class);
        return value == null ? 0 : value;
    }
}
