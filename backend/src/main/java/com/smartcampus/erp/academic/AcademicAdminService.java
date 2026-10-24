package com.smartcampus.erp.academic;

import com.smartcampus.erp.audit.AuditService;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.common.Ids;
import com.smartcampus.erp.user.FacultyRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcademicAdminService {
    private final AcademicRepository academicRepository;
    private final FacultyRepository facultyRepository;
    private final AuditService auditService;

    public AcademicAdminService(AcademicRepository academicRepository,
                                FacultyRepository facultyRepository,
                                AuditService auditService) {
        this.academicRepository = academicRepository;
        this.facultyRepository = facultyRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ClassGroup createClassGroup(ClassGroupRequest request) {
        AuthContext.requireRole("ADMIN");
        Course course = academicRepository.courses().stream()
                .filter(candidate -> candidate.id().equals(request.courseId()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Course not found."));
        if (request.semester() > course.totalSemesters()) {
            throw ApiException.badRequest("Semester exceeds the course duration.");
        }
        ClassGroup group = new ClassGroup(
                Ids.newId("cg"),
                request.name(),
                request.courseId(),
                request.semester(),
                request.section(),
                request.academicYear(),
                0);
        academicRepository.insertClassGroup(group);
        auditService.log("CREATE_CLASS_GROUP", "CLASS_GROUP", group.id(),
                "Created class group " + group.name() + ".");
        return group;
    }

    @Transactional
    public ClassGroup updateClassGroup(String id, ClassGroupRequest request) {
        AuthContext.requireRole("ADMIN");
        ClassGroup existing = academicRepository.classGroupById(id)
                .orElseThrow(() -> ApiException.notFound("Class group not found."));
        Course course = academicRepository.courses().stream()
                .filter(candidate -> candidate.id().equals(request.courseId()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Course not found."));
        if (request.semester() > course.totalSemesters()) {
            throw ApiException.badRequest("Semester exceeds the course duration.");
        }
        ClassGroup updated = new ClassGroup(
                existing.id(),
                request.name(),
                request.courseId(),
                request.semester(),
                request.section(),
                request.academicYear(),
                existing.totalStudents());
        academicRepository.updateClassGroup(updated);
        auditService.log("UPDATE_CLASS_GROUP", "CLASS_GROUP", id,
                "Updated class group " + updated.name() + ".");
        return updated;
    }

    @Transactional
    public void deleteClassGroup(String id) {
        AuthContext.requireRole("ADMIN");
        if (academicRepository.classGroupById(id).isEmpty()) {
            throw ApiException.notFound("Class group not found.");
        }
        if (academicRepository.countClassGroupStudents(id) > 0) {
            throw ApiException.conflict("Students are still assigned to this class group.");
        }
        try {
            academicRepository.deleteClassGroup(id);
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("This class group is referenced by timetable, assignments, or enrollments.");
        }
        auditService.log("DELETE_CLASS_GROUP", "CLASS_GROUP", id, "Deleted class group.");
    }

    @Transactional
    public FacultyAssignment createAssignment(AssignmentRequest request) {
        AuthContext.requireRole("ADMIN");
        var faculty = facultyRepository.findById(request.facultyId())
                .orElseThrow(() -> ApiException.badRequest("Faculty not found."));
        Subject subject = academicRepository.subjectById(request.subjectId())
                .orElseThrow(() -> ApiException.badRequest("Subject not found."));
        ClassGroup group = academicRepository.classGroupById(request.classGroupId())
                .orElseThrow(() -> ApiException.badRequest("Class group not found."));
        if (!subject.courseId().equals(group.courseId()) || subject.semester() != group.semester()) {
            throw ApiException.badRequest("The subject does not belong to the class group's course and semester.");
        }
        if (academicRepository.existsAssignment(faculty.id(), subject.id(), group.id())) {
            throw ApiException.conflict("This faculty is already assigned to the subject and class group.");
        }
        FacultyAssignment assignment = new FacultyAssignment(
                Ids.newId("fa"),
                faculty.id(),
                subject.id(),
                group.id(),
                request.academicYear(),
                group.semester());
        academicRepository.insertAssignment(assignment);
        auditService.log("CREATE_FACULTY_ASSIGNMENT", "FACULTY_ASSIGNMENT", assignment.id(),
                "Assigned " + faculty.fullName() + " to " + subject.code() + " for " + group.name() + ".");
        return assignment;
    }

    @Transactional
    public void deleteAssignment(String id) {
        AuthContext.requireRole("ADMIN");
        FacultyAssignment assignment = academicRepository.assignmentById(id)
                .orElseThrow(() -> ApiException.notFound("Faculty assignment not found."));
        try {
            academicRepository.deleteAssignment(id);
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("Class sessions or examinations reference this assignment.");
        }
        auditService.log("DELETE_FACULTY_ASSIGNMENT", "FACULTY_ASSIGNMENT", id,
                "Removed faculty assignment for subject " + assignment.subjectId() + ".");
    }
}
