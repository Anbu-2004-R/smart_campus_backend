package com.smartcampus.erp.academic;

import java.sql.Time;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AcademicRepository {
    private static final RowMapper<Department> DEPARTMENT_MAPPER = (rs, rowNum) -> new Department(
            rs.getString("id"), rs.getString("code"), rs.getString("name"),
            rs.getString("hod_name"), rs.getInt("faculty_count"), rs.getInt("student_count"));

    private static final RowMapper<Course> COURSE_MAPPER = (rs, rowNum) -> new Course(
            rs.getString("id"), rs.getString("code"), rs.getString("name"),
            rs.getString("department_id"), rs.getInt("total_semesters"), rs.getString("degree_type"));

    private static final RowMapper<Subject> SUBJECT_MAPPER = (rs, rowNum) -> new Subject(
            rs.getString("id"), rs.getString("code"), rs.getString("name"),
            rs.getString("course_id"), rs.getInt("semester"), rs.getBigDecimal("credits"),
            rs.getInt("max_marks"), rs.getInt("pass_marks"), rs.getString("type"));

    private static final RowMapper<ClassGroup> CLASS_GROUP_MAPPER = (rs, rowNum) -> new ClassGroup(
            rs.getString("id"), rs.getString("name"), rs.getString("course_id"),
            rs.getInt("semester"), rs.getString("section"), rs.getString("academic_year"),
            rs.getInt("total_students"));

    private static final RowMapper<Classroom> CLASSROOM_MAPPER = (rs, rowNum) -> new Classroom(
            rs.getString("id"), rs.getString("room_number"), rs.getString("building"),
            rs.getInt("floor"), rs.getInt("capacity"), rs.getString("type"));

    private static final RowMapper<FacultyAssignment> ASSIGNMENT_MAPPER = (rs, rowNum) -> new FacultyAssignment(
            rs.getString("id"), rs.getString("faculty_id"), rs.getString("subject_id"),
            rs.getString("class_group_id"), rs.getString("academic_year"), rs.getInt("semester"));

    private static final RowMapper<TimetableEntry> TIMETABLE_MAPPER = (rs, rowNum) -> new TimetableEntry(
            rs.getString("id"), rs.getString("day_of_week"), rs.getInt("period"),
            time(rs.getTime("start_time")), time(rs.getTime("end_time")),
            rs.getString("class_group_id"), rs.getString("subject_id"),
            rs.getString("faculty_id"), rs.getString("classroom_id"));

    private final JdbcTemplate jdbc;

    public AcademicRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Department> departments() {
        return jdbc.query("SELECT * FROM departments ORDER BY code", DEPARTMENT_MAPPER);
    }

    public List<Course> courses() {
        return jdbc.query("SELECT * FROM courses ORDER BY code", COURSE_MAPPER);
    }

    public List<Subject> subjects(String courseId, Integer semester) {
        StringBuilder sql = new StringBuilder("SELECT * FROM subjects WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (courseId != null && !courseId.isBlank()) {
            sql.append(" AND course_id = ?");
            params.add(courseId);
        }
        if (semester != null) {
            sql.append(" AND semester = ?");
            params.add(semester);
        }
        sql.append(" ORDER BY semester, code");
        return jdbc.query(sql.toString(), SUBJECT_MAPPER, params.toArray());
    }

    public Optional<Subject> subjectById(String id) {
        return jdbc.query("SELECT * FROM subjects WHERE id = ?", SUBJECT_MAPPER, id).stream().findFirst();
    }

    public List<ClassGroup> classGroups(String courseId, Integer semester) {
        StringBuilder sql = new StringBuilder("SELECT * FROM class_groups WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (courseId != null && !courseId.isBlank()) {
            sql.append(" AND course_id = ?");
            params.add(courseId);
        }
        if (semester != null) {
            sql.append(" AND semester = ?");
            params.add(semester);
        }
        sql.append(" ORDER BY academic_year DESC, semester, section");
        return jdbc.query(sql.toString(), CLASS_GROUP_MAPPER, params.toArray());
    }

    public Optional<ClassGroup> classGroupById(String id) {
        return jdbc.query("SELECT * FROM class_groups WHERE id = ?", CLASS_GROUP_MAPPER, id)
                .stream().findFirst();
    }

    public List<Classroom> classrooms() {
        return jdbc.query("SELECT * FROM classrooms ORDER BY room_number", CLASSROOM_MAPPER);
    }

    public Optional<Classroom> classroomById(String id) {
        return jdbc.query("SELECT * FROM classrooms WHERE id = ?", CLASSROOM_MAPPER, id)
                .stream().findFirst();
    }

    public List<FacultyAssignment> assignments(String facultyId, String classGroupId) {
        StringBuilder sql = new StringBuilder("SELECT * FROM faculty_subject_assignments WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (facultyId != null && !facultyId.isBlank()) {
            sql.append(" AND faculty_id = ?");
            params.add(facultyId);
        }
        if (classGroupId != null && !classGroupId.isBlank()) {
            sql.append(" AND class_group_id = ?");
            params.add(classGroupId);
        }
        sql.append(" ORDER BY academic_year DESC, semester, id");
        return jdbc.query(sql.toString(), ASSIGNMENT_MAPPER, params.toArray());
    }

    public Optional<FacultyAssignment> assignmentById(String id) {
        return jdbc.query("SELECT * FROM faculty_subject_assignments WHERE id = ?", ASSIGNMENT_MAPPER, id)
                .stream().findFirst();
    }

    public boolean existsAssignment(String facultyId, String subjectId, String classGroupId) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM faculty_subject_assignments"
                        + " WHERE faculty_id = ? AND subject_id = ? AND class_group_id = ?",
                Long.class, facultyId, subjectId, classGroupId);
        return count != null && count > 0;
    }

    public Optional<FacultyAssignment> assignmentFor(String facultyId, String subjectId, String classGroupId) {
        return jdbc.query("SELECT * FROM faculty_subject_assignments"
                        + " WHERE faculty_id = ? AND subject_id = ? AND class_group_id = ? LIMIT 1",
                ASSIGNMENT_MAPPER, facultyId, subjectId, classGroupId).stream().findFirst();
    }

    public List<TimetableEntry> timetable(String facultyId, String classGroupId) {
        StringBuilder sql = new StringBuilder("SELECT * FROM timetable_entries WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (facultyId != null && !facultyId.isBlank()) {
            sql.append(" AND faculty_id = ?");
            params.add(facultyId);
        }
        if (classGroupId != null && !classGroupId.isBlank()) {
            sql.append(" AND class_group_id = ?");
            params.add(classGroupId);
        }
        sql.append(" ORDER BY FIELD(day_of_week, 'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'), period");
        return jdbc.query(sql.toString(), TIMETABLE_MAPPER, params.toArray());
    }

    public Optional<TimetableEntry> timetableById(String id) {
        return jdbc.query("SELECT * FROM timetable_entries WHERE id = ?", TIMETABLE_MAPPER, id)
                .stream().findFirst();
    }

    public Optional<TimetableEntry> findConflict(String dayOfWeek, int period, String ignoreId,
                                                 String facultyId, String classroomId, String classGroupId) {
        return jdbc.query("SELECT * FROM timetable_entries WHERE day_of_week = ? AND period = ?"
                        + " AND (? IS NULL OR id <> ?)"
                        + " AND (faculty_id = ? OR classroom_id = ? OR class_group_id = ?) LIMIT 1",
                TIMETABLE_MAPPER, dayOfWeek, period, ignoreId, ignoreId,
                facultyId, classroomId, classGroupId).stream().findFirst();
    }

    public void insertTimetable(TimetableEntry entry) {
        jdbc.update("INSERT INTO timetable_entries (id, day_of_week, period, start_time, end_time,"
                        + " class_group_id, subject_id, faculty_id, classroom_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                entry.id(), entry.dayOfWeek(), entry.period(),
                Time.valueOf(LocalTime.parse(entry.startTime())),
                Time.valueOf(LocalTime.parse(entry.endTime())),
                entry.classGroupId(), entry.subjectId(), entry.facultyId(), entry.classroomId());
    }

    public void updateTimetable(TimetableEntry entry) {
        jdbc.update("UPDATE timetable_entries SET day_of_week = ?, period = ?, start_time = ?, end_time = ?,"
                        + " class_group_id = ?, subject_id = ?, faculty_id = ?, classroom_id = ? WHERE id = ?",
                entry.dayOfWeek(), entry.period(),
                Time.valueOf(LocalTime.parse(entry.startTime())),
                Time.valueOf(LocalTime.parse(entry.endTime())),
                entry.classGroupId(), entry.subjectId(), entry.facultyId(), entry.classroomId(), entry.id());
    }

    public void deleteTimetable(String id) {
        jdbc.update("DELETE FROM timetable_entries WHERE id = ?", id);
    }

    public void insertClassGroup(ClassGroup group) {
        jdbc.update("INSERT INTO class_groups (id, name, course_id, semester, section, academic_year, total_students)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?)",
                group.id(), group.name(), group.courseId(), group.semester(), group.section(),
                group.academicYear(), group.totalStudents());
    }

    public void updateClassGroup(ClassGroup group) {
        jdbc.update("UPDATE class_groups SET name = ?, course_id = ?, semester = ?, section = ?,"
                        + " academic_year = ?, total_students = ? WHERE id = ?",
                group.name(), group.courseId(), group.semester(), group.section(),
                group.academicYear(), group.totalStudents(), group.id());
    }

    public void deleteClassGroup(String id) {
        jdbc.update("DELETE FROM class_groups WHERE id = ?", id);
    }

    public void insertAssignment(FacultyAssignment assignment) {
        jdbc.update("INSERT INTO faculty_subject_assignments (id, faculty_id, subject_id, class_group_id,"
                        + " academic_year, semester) VALUES (?, ?, ?, ?, ?, ?)",
                assignment.id(), assignment.facultyId(), assignment.subjectId(), assignment.classGroupId(),
                assignment.academicYear(), assignment.semester());
    }

    public void deleteAssignment(String id) {
        jdbc.update("DELETE FROM faculty_subject_assignments WHERE id = ?", id);
    }

    public long countClassGroupStudents(String classGroupId) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM student_profiles WHERE class_group_id = ?",
                Long.class, classGroupId);
        return value == null ? 0 : value;
    }

    public long countDepartments() {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM departments", Long.class);
        return value == null ? 0 : value;
    }

    private static String time(Time value) {
        return value == null ? null : value.toLocalTime().toString();
    }
}
