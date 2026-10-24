package com.smartcampus.erp.user;

import com.smartcampus.erp.common.Sql;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class StudentRepository {
    private static final String COLUMNS = "id, user_id, register_number, full_name, department_id, course_id,"
            + " current_semester, academic_year, email, phone, date_of_birth, avatar_url, class_group_id";

    private static final RowMapper<StudentProfile> MAPPER = (rs, rowNum) -> new StudentProfile(
            rs.getString("id"),
            rs.getString("user_id"),
            rs.getString("register_number"),
            rs.getString("full_name"),
            rs.getString("department_id"),
            rs.getString("course_id"),
            rs.getInt("current_semester"),
            rs.getString("academic_year"),
            rs.getString("email"),
            rs.getString("phone"),
            Sql.date(rs, "date_of_birth"),
            rs.getString("avatar_url"),
            rs.getString("class_group_id"));

    private final JdbcTemplate jdbc;

    public StudentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<StudentProfile> findById(String id) {
        return jdbc.query("SELECT " + COLUMNS + " FROM student_profiles WHERE id = ?", MAPPER, id)
                .stream().findFirst();
    }

    public Optional<StudentProfile> findByUserId(String userId) {
        return jdbc.query("SELECT " + COLUMNS + " FROM student_profiles WHERE user_id = ?", MAPPER, userId)
                .stream().findFirst();
    }

    public Optional<StudentProfile> findByRegisterNumber(String registerNumber) {
        return jdbc.query("SELECT " + COLUMNS + " FROM student_profiles WHERE LOWER(register_number) = LOWER(?)",
                MAPPER, registerNumber).stream().findFirst();
    }

    public List<StudentProfile> findAll() {
        return jdbc.query("SELECT " + COLUMNS + " FROM student_profiles ORDER BY register_number", MAPPER);
    }

    public List<StudentProfile> findByClassGroup(String classGroupId) {
        return jdbc.query("SELECT " + COLUMNS + " FROM student_profiles WHERE class_group_id = ? ORDER BY register_number",
                MAPPER, classGroupId);
    }

    public void insert(StudentProfile profile) {
        jdbc.update("INSERT INTO student_profiles (id, user_id, register_number, full_name, department_id, course_id,"
                        + " current_semester, academic_year, email, phone, date_of_birth, avatar_url, class_group_id)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                profile.id(), profile.userId(), profile.registerNumber(), profile.fullName(),
                profile.departmentId(), profile.courseId(), profile.currentSemester(), profile.academicYear(),
                profile.email(), profile.phone(), profile.dateOfBirth(), profile.avatarUrl(), profile.classGroupId());
    }

    public void updateProgression(String studentId, int semester, String academicYear, String classGroupId) {
        jdbc.update("UPDATE student_profiles SET current_semester = ?, academic_year = ?, class_group_id = ? WHERE id = ?",
                semester, academicYear, classGroupId, studentId);
    }

    public long count() {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM student_profiles", Long.class);
        return value == null ? 0 : value;
    }

    public List<String> findIdsByClassGroup(String classGroupId) {
        return jdbc.queryForList("SELECT id FROM student_profiles WHERE class_group_id = ?",
                String.class, classGroupId);
    }

    public List<StudentProfile> findActiveForTerm(int semester, String academicYear) {
        return jdbc.query("SELECT DISTINCT sp.* FROM student_profiles sp"
                        + " JOIN users u ON u.id = sp.user_id AND u.status = 'ACTIVE'"
                        + " JOIN student_enrollments e ON e.student_id = sp.id AND e.status = 'ACTIVE'"
                        + " WHERE e.semester = ? AND e.academic_year = ? ORDER BY sp.register_number",
                MAPPER, semester, academicYear);
    }
}
