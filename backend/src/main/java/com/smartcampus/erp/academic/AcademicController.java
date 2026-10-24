package com.smartcampus.erp.academic;

import com.smartcampus.erp.auth.RequireRole;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AcademicController {
    private final AcademicRepository academicRepository;
    private final TimetableService timetableService;
    private final AcademicAdminService academicAdminService;

    public AcademicController(AcademicRepository academicRepository,
                              TimetableService timetableService,
                              AcademicAdminService academicAdminService) {
        this.academicRepository = academicRepository;
        this.timetableService = timetableService;
        this.academicAdminService = academicAdminService;
    }

    @GetMapping("/departments")
    public List<Department> departments() {
        return academicRepository.departments();
    }

    @GetMapping("/courses")
    public List<Course> courses() {
        return academicRepository.courses();
    }

    @GetMapping("/subjects")
    public List<Subject> subjects(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) Integer semester) {
        return academicRepository.subjects(courseId, semester);
    }

    @GetMapping("/class-groups")
    public List<ClassGroup> classGroups(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) Integer semester) {
        return academicRepository.classGroups(courseId, semester);
    }

    @GetMapping("/classrooms")
    public List<Classroom> classrooms() {
        return academicRepository.classrooms();
    }

    @PostMapping("/class-groups")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.CREATED)
    public ClassGroup createClassGroup(@Valid @RequestBody ClassGroupRequest request) {
        return academicAdminService.createClassGroup(request);
    }

    @PutMapping("/class-groups/{id}")
    @RequireRole("ADMIN")
    public ClassGroup updateClassGroup(@PathVariable String id,
                                       @Valid @RequestBody ClassGroupRequest request) {
        return academicAdminService.updateClassGroup(id, request);
    }

    @DeleteMapping("/class-groups/{id}")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClassGroup(@PathVariable String id) {
        academicAdminService.deleteClassGroup(id);
    }

    @GetMapping("/faculty-assignments")
    public List<FacultyAssignment> assignments(
            @RequestParam(required = false) String facultyId,
            @RequestParam(required = false) String classGroupId) {
        return academicRepository.assignments(facultyId, classGroupId);
    }

    @PostMapping("/faculty-assignments")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.CREATED)
    public FacultyAssignment createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return academicAdminService.createAssignment(request);
    }

    @DeleteMapping("/faculty-assignments/{id}")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAssignment(@PathVariable String id) {
        academicAdminService.deleteAssignment(id);
    }

    @GetMapping("/timetable")
    public List<TimetableEntry> timetable(
            @RequestParam(required = false) String facultyId,
            @RequestParam(required = false) String classGroupId) {
        return timetableService.list(facultyId, classGroupId);
    }

    @PostMapping("/timetable")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.CREATED)
    public TimetableEntry createTimetable(@Valid @RequestBody TimetableRequest request) {
        return timetableService.save(request, null);
    }

    @PutMapping("/timetable/{id}")
    @RequireRole("ADMIN")
    public TimetableEntry updateTimetable(@PathVariable String id, @Valid @RequestBody TimetableRequest request) {
        return timetableService.save(request, id);
    }

    @DeleteMapping("/timetable/{id}")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTimetable(@PathVariable String id) {
        timetableService.delete(id);
    }
}
