package com.smartcampus.erp.user;

import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.auth.RequireRole;
import com.smartcampus.erp.common.ApiException;
import java.util.List;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class DirectoryController {
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public DirectoryController(StudentRepository studentRepository, FacultyRepository facultyRepository) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    @GetMapping("/students")
    @RequireRole({"ADMIN", "FACULTY"})
    public List<StudentProfile> students(@RequestParam(required = false) String classGroupId) {
        return StringUtils.hasText(classGroupId)
                ? studentRepository.findByClassGroup(classGroupId)
                : studentRepository.findAll();
    }

    @GetMapping("/students/{id}")
    @RequireRole({"ADMIN", "FACULTY", "STUDENT"})
    public StudentProfile student(@PathVariable String id) {
        StudentProfile profile = studentRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        if ("STUDENT".equals(AuthContext.role()) && !profile.userId().equals(AuthContext.userId())) {
            throw ApiException.forbidden("You can only view your own student profile.");
        }
        return profile;
    }

    @GetMapping("/faculty")
    @RequireRole({"ADMIN", "FACULTY", "STUDENT"})
    public List<FacultyProfile> faculty() {
        return facultyRepository.findAll();
    }

    @GetMapping("/faculty/{id}")
    @RequireRole({"ADMIN", "FACULTY", "STUDENT"})
    public FacultyProfile faculty(@PathVariable String id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
    }
}
