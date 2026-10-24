package com.smartcampus.erp.academic;

import com.smartcampus.erp.audit.AuditService;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.common.Ids;
import com.smartcampus.erp.user.FacultyProfile;
import com.smartcampus.erp.user.FacultyRepository;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.StudentRepository;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TimetableService {
    private final AcademicRepository academicRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;

    public TimetableService(AcademicRepository academicRepository,
                            FacultyRepository facultyRepository,
                            StudentRepository studentRepository,
                            AuditService auditService) {
        this.academicRepository = academicRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.auditService = auditService;
    }

    public List<TimetableEntry> list(String facultyId, String classGroupId) {
        String role = AuthContext.role();
        if ("STUDENT".equals(role)) {
            StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                    .orElseThrow(() -> ApiException.notFound("Student profile not found."));
            return academicRepository.timetable(null, student.classGroupId());
        }
        if ("FACULTY".equals(role)) {
            FacultyProfile faculty = facultyRepository.findByUserId(AuthContext.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            return academicRepository.timetable(faculty.id(), classGroupId);
        }
        return academicRepository.timetable(facultyId, classGroupId);
    }

    @Transactional
    public TimetableEntry save(TimetableRequest request, String id) {
        AuthContext.requireRole("ADMIN");
        LocalTime start = parseTime(request.startTime());
        LocalTime end = parseTime(request.endTime());
        if (!end.isAfter(start)) {
            throw ApiException.badRequest("End time must be after start time.");
        }
        if (academicRepository.classGroupById(request.classGroupId()).isEmpty()) {
            throw ApiException.badRequest("Class group not found.");
        }
        Subject subject = academicRepository.subjectById(request.subjectId())
                .orElseThrow(() -> ApiException.badRequest("Subject not found."));
        FacultyProfile faculty = facultyRepository.findById(request.facultyId())
                .orElseThrow(() -> ApiException.badRequest("Faculty not found."));
        Classroom classroom = academicRepository.classroomById(request.classroomId())
                .orElseThrow(() -> ApiException.badRequest("Classroom not found."));
        ClassGroup group = academicRepository.classGroupById(request.classGroupId()).orElseThrow();

        if (!subject.courseId().equals(group.courseId()) || subject.semester() != group.semester()) {
            throw ApiException.badRequest("The subject does not belong to the selected class group's course and semester.");
        }
        if (!academicRepository.existsAssignment(faculty.id(), subject.id(), group.id())) {
            throw ApiException.badRequest("The selected faculty is not assigned to this subject and class group.");
        }

        var conflict = academicRepository.findConflict(
                request.dayOfWeek(), request.period(), id,
                request.facultyId(), request.classroomId(), request.classGroupId());
        if (conflict.isPresent()) {
            TimetableEntry existing = conflict.get();
            if (existing.facultyId().equals(request.facultyId())) {
                throw ApiException.conflict("Faculty Conflict: " + faculty.fullName()
                        + " is already scheduled in Period " + request.period() + " on " + request.dayOfWeek() + ".");
            }
            if (existing.classroomId().equals(request.classroomId())) {
                throw ApiException.conflict("Classroom Conflict: Room " + classroom.roomNumber()
                        + " is already booked in Period " + request.period() + " on " + request.dayOfWeek() + ".");
            }
            throw ApiException.conflict("Student Group Clash: " + group.name()
                    + " already has a scheduled class in Period " + request.period() + " on " + request.dayOfWeek() + ".");
        }

        TimetableEntry entry = new TimetableEntry(
                id == null ? Ids.newId("tt") : id,
                request.dayOfWeek(),
                request.period(),
                start.toString(),
                end.toString(),
                request.classGroupId(),
                request.subjectId(),
                request.facultyId(),
                request.classroomId());

        if (id == null) {
            academicRepository.insertTimetable(entry);
        } else {
            if (academicRepository.timetableById(id).isEmpty()) {
                throw ApiException.notFound("Timetable entry not found.");
            }
            academicRepository.updateTimetable(entry);
        }
        auditService.log("MODIFY_TIMETABLE", "TIMETABLE", entry.id(),
                "Saved timetable slot for " + entry.dayOfWeek() + " Period " + entry.period() + ".");
        return entry;
    }

    @Transactional
    public void delete(String id) {
        AuthContext.requireRole("ADMIN");
        if (academicRepository.timetableById(id).isEmpty()) {
            throw ApiException.notFound("Timetable entry not found.");
        }
        academicRepository.deleteTimetable(id);
        auditService.log("DELETE_TIMETABLE_SLOT", "TIMETABLE", id,
                "Removed scheduled session from timetable.");
    }

    private LocalTime parseTime(String value) {
        try {
            return LocalTime.parse(value.length() == 5 ? value : value.substring(0, 5));
        } catch (DateTimeParseException ex) {
            throw ApiException.badRequest("Time must use HH:mm format.");
        }
    }
}
