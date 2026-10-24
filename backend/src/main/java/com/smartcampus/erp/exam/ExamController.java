package com.smartcampus.erp.exam;

import com.smartcampus.erp.auth.RequireRole;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ExamController {
    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/exams")
    public List<Exam> exams() {
        return examService.exams();
    }

    @GetMapping("/exams/{id}")
    public Exam exam(@PathVariable String id) {
        return examService.exam(id);
    }

    @GetMapping("/grade-rules")
    public List<GradeRule> gradeRules() {
        return examService.gradeRules();
    }

    @GetMapping("/exams/{examId}/subjects/{subjectId}/marks")
    @RequireRole({"FACULTY", "ADMIN"})
    public List<MarkView> marks(@PathVariable String examId, @PathVariable String subjectId) {
        return examService.marksForSubject(examId, subjectId);
    }

    @GetMapping("/exams/{examId}/marks/me")
    @RequireRole("STUDENT")
    public List<MarkView> myMarks(@PathVariable String examId) {
        return examService.myMarks(examId);
    }

    @PostMapping("/exams/marks")
    @RequireRole("FACULTY")
    public List<MarkView> saveMarks(@Valid @RequestBody MarksEntryRequest request) {
        return examService.saveMarks(request);
    }

    @PostMapping("/exams/{examId}/publish")
    @RequireRole("ADMIN")
    public List<SemesterResult> publish(@PathVariable String examId) {
        return examService.publish(examId);
    }

    @GetMapping("/exams/{examId}/results")
    @RequireRole({"FACULTY", "ADMIN"})
    public List<SemesterResult> examResults(@PathVariable String examId) {
        return examService.resultsForExam(examId);
    }

    @GetMapping("/results")
    @RequireRole("ADMIN")
    public List<SemesterResult> allResults() {
        return examService.allResults();
    }

    @GetMapping("/results/me")
    @RequireRole("STUDENT")
    public List<SemesterResult> myResults() {
        return examService.myResults();
    }

    @GetMapping("/results/student/{studentId}")
    @RequireRole({"FACULTY", "ADMIN"})
    public List<SemesterResult> studentResults(@PathVariable String studentId) {
        return examService.resultsForStudent(studentId);
    }

    @GetMapping("/arrears")
    @RequireRole("ADMIN")
    public List<ArrearRecord> allArrears() {
        return examService.allArrears();
    }

    @GetMapping("/arrears/me")
    @RequireRole("STUDENT")
    public List<ArrearRecord> myArrears() {
        return examService.myArrears();
    }

    @GetMapping("/arrears/student/{studentId}")
    @RequireRole({"FACULTY", "ADMIN"})
    public List<ArrearRecord> studentArrears(@PathVariable String studentId) {
        return examService.arrearsForStudent(studentId);
    }

    @GetMapping("/marks-corrections")
    @RequireRole({"FACULTY", "ADMIN"})
    public List<MarksCorrection> corrections(@RequestParam(required = false) String status) {
        return examService.corrections(status);
    }

    @PostMapping("/marks-corrections")
    @RequireRole("FACULTY")
    @ResponseStatus(HttpStatus.CREATED)
    public MarksCorrection submitCorrection(@Valid @RequestBody MarksCorrectionCreateRequest request) {
        return examService.submitCorrection(request);
    }

    @PatchMapping("/marks-corrections/{id}/review")
    @RequireRole("ADMIN")
    public MarksCorrection reviewCorrection(@PathVariable String id,
                                            @Valid @RequestBody MarksCorrectionReviewRequest request) {
        return examService.reviewCorrection(id, request);
    }
}
