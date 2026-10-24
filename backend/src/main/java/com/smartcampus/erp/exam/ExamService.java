package com.smartcampus.erp.exam;

import com.smartcampus.erp.academic.AcademicRepository;
import com.smartcampus.erp.academic.FacultyAssignment;
import com.smartcampus.erp.audit.AuditService;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.auth.AuthPrincipal;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.common.Ids;
import com.smartcampus.erp.config.AcademicClock;
import com.smartcampus.erp.notification.NotificationService;
import com.smartcampus.erp.user.FacultyProfile;
import com.smartcampus.erp.user.FacultyRepository;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.StudentRepository;
import com.smartcampus.erp.user.User;
import com.smartcampus.erp.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamService {
    private final ExamRepository examRepository;
    private final AcademicRepository academicRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AcademicClock clock;

    public ExamService(ExamRepository examRepository,
                       AcademicRepository academicRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository,
                       UserRepository userRepository,
                       NotificationService notificationService,
                       AuditService auditService,
                       AcademicClock clock) {
        this.examRepository = examRepository;
        this.academicRepository = academicRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.clock = clock;
    }

    public List<Exam> exams() {
        return examRepository.exams();
    }

    public Exam exam(String id) {
        return examRepository.examById(id)
                .orElseThrow(() -> ApiException.notFound("Exam not found."));
    }

    public List<GradeRule> gradeRules() {
        return examRepository.gradeRules();
    }

    public List<MarkView> marksForSubject(String examId, String subjectId) {
        AuthPrincipal principal = AuthContext.require();
        ExamSubjectView examSubject = examRepository.examSubject(examId, subjectId)
                .orElseThrow(() -> ApiException.notFound("Exam subject not found."));
        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            requireFacultyAssignment(faculty.id(), examSubject);
        } else if (!"ADMIN".equals(principal.role())) {
            throw ApiException.forbidden("Only faculty and administrators can view subject marks.");
        }
        return examRepository.marks(examId, subjectId);
    }

    public List<MarkView> myMarks(String examId) {
        AuthContext.requireRole("STUDENT");
        StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        Exam exam = exam(examId);
        if (!"PUBLISHED".equals(exam.status())) {
            throw ApiException.forbidden("Marks are not available until the result is published.");
        }
        return examRepository.marksForStudent(examId, student.id());
    }

    @Transactional
    public List<MarkView> saveMarks(MarksEntryRequest request) {
        AuthContext.requireRole("FACULTY");
        FacultyProfile faculty = facultyRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
        Exam exam = exam(request.examId());
        if ("PUBLISHED".equals(exam.status())) {
            throw ApiException.conflict("Published exam marks can only be changed through a correction request.");
        }
        ExamSubjectView examSubject = examRepository.examSubject(exam.id(), request.subjectId())
                .orElseThrow(() -> ApiException.badRequest("The subject is not part of this exam."));
        requireFacultyAssignment(faculty.id(), examSubject);
        List<GradeRule> rules = examRepository.gradeRules();

        List<MarkView> saved = new ArrayList<>();
        for (MarkEntryRequest entry : request.marks()) {
            StudentProfile student = studentRepository.findById(entry.studentId())
                    .orElseThrow(() -> ApiException.badRequest("Student " + entry.studentId() + " not found."));
            if (!academicRepository.existsAssignment(faculty.id(), examSubject.subjectId(), student.classGroupId())) {
                throw ApiException.forbidden("You are not assigned to " + student.registerNumber() + "'s class.");
            }
            BigDecimal marks = validateMarks(entry, examSubject.maxMarks());
            GradeInfo info = gradeInfo(marks, examSubject.maxMarks(), entry.status(), rules, examSubject.passMarks());
            Optional<MarkView> existing = examRepository.mark(exam.id(), examSubject.subjectId(), student.id());
            MarkView mark = new MarkView(
                    existing.map(MarkView::id).orElse(Ids.newId("mk")),
                    exam.id(),
                    examSubject.subjectId(),
                    student.id(),
                    student.registerNumber(),
                    student.fullName(),
                    entry.status(),
                    marks,
                    info.grade(),
                    info.point(),
                    info.passed(),
                    faculty.id(),
                    clock.now());
            examRepository.upsertMark(mark);
            saved.add(mark);
        }
        auditService.log("ENTER_MARKS", "EXAM", exam.id(),
                "Saved marks for " + examSubject.subjectCode() + " (" + saved.size() + " students).");
        return saved;
    }

    @Transactional
    public List<SemesterResult> publish(String examId) {
        AuthContext.requireRole("ADMIN");
        Exam exam = exam(examId);
        if ("PUBLISHED".equals(exam.status())) {
            throw ApiException.conflict("Results for this exam are already published.");
        }
        if (exam.subjects().isEmpty()) {
            throw ApiException.badRequest("This exam has no subjects configured.");
        }
        List<StudentProfile> students = studentRepository.findActiveForTerm(exam.semester(), exam.academicYear());
        if (students.isEmpty()) {
            throw ApiException.badRequest("No active students are enrolled for this exam's term.");
        }

        List<MarkView> allMarks = examRepository.marksForExam(exam.id());
        Map<String, MarkView> marksBySubjectAndStudent = new HashMap<>();
        for (MarkView mark : allMarks) {
            marksBySubjectAndStudent.put(mark.subjectId() + ":" + mark.studentId(), mark);
        }

        List<String> missingExamples = new ArrayList<>();
        int missingCount = 0;
        for (StudentProfile student : students) {
            for (ExamSubjectView subject : exam.subjects()) {
                if (!marksBySubjectAndStudent.containsKey(subject.subjectId() + ":" + student.id())) {
                    missingCount++;
                    if (missingExamples.size() < 5) {
                        missingExamples.add(student.registerNumber() + " / " + subject.subjectCode());
                    }
                }
            }
        }
        if (missingCount > 0) {
            throw ApiException.conflict("Cannot publish. Marks are missing for " + missingCount
                    + " student-subject combinations (e.g., " + String.join(", ", missingExamples) + ").");
        }

        List<GradeRule> rules = examRepository.gradeRules();
        LocalDateTime now = clock.now();
        String publishedBy = AuthContext.require().name();
        List<String> summary = new ArrayList<>();

        for (StudentProfile student : students) {
            Map<String, MarkView> studentMarks = new HashMap<>();
            for (ExamSubjectView subject : exam.subjects()) {
                studentMarks.put(subject.subjectId(),
                        marksBySubjectAndStudent.get(subject.subjectId() + ":" + student.id()));
            }
            SemesterResult result = buildResult(exam, student, exam.subjects(), studentMarks, rules, now);
            examRepository.deleteResult(student.id(), exam.id());
            examRepository.insertResult(result);
            examRepository.updateCgpaForStudent(student.id(), result.overallCgpa());
            updateArrears(exam, student, result);

            if (!"PASS".equals(result.overallResult())) {
                summary.add(student.registerNumber());
            }
            notificationService.notifyUser(student.userId(), "Results Published",
                    "Your " + exam.name() + " result is now available. Semester GPA: "
                            + result.semesterGpa() + ", CGPA: " + result.overallCgpa() + ".",
                    "EXAM_UPDATE", exam.id());
        }

        examRepository.updateExamStatus(exam.id(), "PUBLISHED", now, publishedBy);
        auditService.log("PUBLISH_RESULTS", "EXAM", exam.id(),
                "Published results for " + students.size() + " students. " + summary.size() + " with arrears.");
        return examRepository.resultsForExam(exam.id());
    }

    public List<SemesterResult> myResults() {
        AuthContext.requireRole("STUDENT");
        StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        return examRepository.resultsForStudent(student.id());
    }

    public List<SemesterResult> resultsForStudent(String studentId) {
        AuthPrincipal principal = AuthContext.require();
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student not found."));
        if ("STUDENT".equals(principal.role()) && !student.userId().equals(principal.userId())) {
            throw ApiException.forbidden("You can only view your own results.");
        }
        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            if (academicRepository.assignments(faculty.id(), student.classGroupId()).isEmpty()) {
                throw ApiException.forbidden("You can only view results for your assigned classes.");
            }
        }
        return examRepository.resultsForStudent(student.id());
    }

    public List<SemesterResult> resultsForExam(String examId) {
        AuthContext.requireRole("ADMIN", "FACULTY");
        return examRepository.resultsForExam(examId);
    }

    public List<SemesterResult> allResults() {
        AuthContext.requireRole("ADMIN");
        return examRepository.allResults();
    }

    public List<ArrearRecord> myArrears() {
        AuthContext.requireRole("STUDENT");
        StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        return examRepository.arrearsForStudent(student.id());
    }

    public List<ArrearRecord> arrearsForStudent(String studentId) {
        AuthContext.requireRole("ADMIN", "FACULTY", "STUDENT");
        return examRepository.arrearsForStudent(studentId);
    }

    public List<ArrearRecord> allArrears() {
        AuthContext.requireRole("ADMIN");
        return examRepository.allArrears();
    }

    public List<MarksCorrection> corrections(String status) {
        AuthPrincipal principal = AuthContext.require();
        if (!"ADMIN".equals(principal.role()) && !"FACULTY".equals(principal.role())) {
            throw ApiException.forbidden("Only faculty and administrators can view marks corrections.");
        }
        return examRepository.marksCorrections(principal.role(), principal.userId(), status);
    }

    @Transactional
    public MarksCorrection submitCorrection(MarksCorrectionCreateRequest request) {
        AuthContext.requireRole("FACULTY");
        FacultyProfile faculty = facultyRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
        Exam exam = exam(request.examId());
        ExamSubjectView examSubject = examRepository.examSubject(exam.id(), request.subjectId())
                .orElseThrow(() -> ApiException.badRequest("The subject is not part of this exam."));
        StudentProfile student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ApiException.notFound("Student not found."));
        if (!academicRepository.existsAssignment(faculty.id(), examSubject.subjectId(), student.classGroupId())) {
            throw ApiException.forbidden("You are not assigned to this student's class for this subject.");
        }
        MarkView mark = examRepository.mark(exam.id(), examSubject.subjectId(), student.id())
                .orElseThrow(() -> ApiException.badRequest("No marks exist for this student and subject."));
        if (examRepository.hasPendingMarksCorrection(exam.id(), examSubject.subjectId(), student.id())) {
            throw ApiException.conflict("A correction request for this mark is already pending.");
        }
        BigDecimal marks = validateMarks(new MarkEntryRequest(student.id(), request.newStatus(),
                request.newMarks()), examSubject.maxMarks());

        MarksCorrection correction = new MarksCorrection(
                Ids.newId("mkcorr"),
                exam.id(),
                examSubject.subjectId(),
                examSubject.subjectCode(),
                student.id(),
                student.fullName(),
                student.registerNumber(),
                faculty.id(),
                faculty.fullName(),
                mark.marksObtained(),
                marks,
                mark.status(),
                request.newStatus(),
                request.reason(),
                "PENDING",
                clock.now(),
                null,
                null,
                null);
        examRepository.insertMarksCorrection(correction);
        for (var admin : userAdmins()) {
            notificationService.notifyUser(admin, "Marks Correction Request",
                    faculty.fullName() + " requested a marks correction for " + student.registerNumber()
                            + " in " + examSubject.subjectCode() + ".",
                    "MARKS_CORRECTION", correction.id());
        }
        auditService.log("REQUEST_MARKS_CORRECTION", "MARKS_CORRECTION", correction.id(),
                "Requested change from " + mark.marksObtained() + " to " + marks + " for "
                        + student.registerNumber() + ".");
        return examRepository.marksCorrection(correction.id()).orElse(correction);
    }

    @Transactional
    public MarksCorrection reviewCorrection(String id, MarksCorrectionReviewRequest request) {
        AuthContext.requireRole("ADMIN");
        MarksCorrection correction = examRepository.marksCorrection(id)
                .orElseThrow(() -> ApiException.notFound("Marks correction request not found."));
        if (!"PENDING".equals(correction.status())) {
            throw ApiException.conflict("This marks correction has already been reviewed.");
        }
        if ("REJECTED".equals(request.decision())
                && (request.notes() == null || request.notes().isBlank())) {
            throw ApiException.badRequest("Review notes are required when rejecting a correction.");
        }
        examRepository.reviewMarksCorrection(id, request.decision(), AuthContext.userId(),
                clock.now(), request.notes());

        if ("APPROVED".equals(request.decision())) {
            Exam exam = exam(correction.examId());
            ExamSubjectView examSubject = examRepository.examSubject(correction.examId(), correction.subjectId())
                    .orElseThrow(() -> ApiException.notFound("Exam subject not found."));
            List<GradeRule> rules = examRepository.gradeRules();
            BigDecimal marks = correction.newMarks();
            GradeInfo info = gradeInfo(marks, examSubject.maxMarks(), correction.newStatus(), rules,
                    examSubject.passMarks());
            StudentProfile student = studentRepository.findById(correction.studentId())
                    .orElseThrow(() -> ApiException.notFound("Student not found."));
            MarkView updated = new MarkView(
                    examRepository.mark(correction.examId(), correction.subjectId(), correction.studentId())
                            .map(MarkView::id).orElse(Ids.newId("mk")),
                    correction.examId(),
                    correction.subjectId(),
                    correction.studentId(),
                    student.registerNumber(),
                    student.fullName(),
                    correction.newStatus(),
                    marks,
                    info.grade(),
                    info.point(),
                    info.passed(),
                    correction.facultyId(),
                    clock.now());
            examRepository.upsertMark(updated);
            if ("PUBLISHED".equals(exam.status())) {
                recalculateStudentResult(exam, student);
            }
        }

        facultyRepository.findById(correction.facultyId()).ifPresent(faculty ->
                notificationService.notifyUser(faculty.userId(),
                        "Marks Correction " + request.decision(),
                        "Your correction request for " + correction.registerNumber() + " in "
                                + correction.subjectCode() + " was " + request.decision().toLowerCase() + ".",
                        "MARKS_CORRECTION", correction.id()));
        auditService.log("REVIEW_MARKS_CORRECTION", "MARKS_CORRECTION", correction.id(),
                request.decision() + " marks correction for " + correction.registerNumber() + ".");
        return examRepository.marksCorrection(correction.id()).orElseThrow();
    }

    private void recalculateStudentResult(Exam exam, StudentProfile student) {
        Map<String, MarkView> marks = new HashMap<>();
        for (MarkView mark : examRepository.marksForStudent(exam.id(), student.id())) {
            marks.put(mark.subjectId(), mark);
        }
        List<GradeRule> rules = examRepository.gradeRules();
        SemesterResult result = buildResult(exam, student, exam.subjects(), marks, rules, clock.now());
        examRepository.deleteResult(student.id(), exam.id());
        examRepository.insertResult(result);
        examRepository.updateCgpaForStudent(student.id(), result.overallCgpa());
        updateArrears(exam, student, result);
    }

    private SemesterResult buildResult(Exam exam, StudentProfile student, List<ExamSubjectView> subjects,
                                       Map<String, MarkView> marks, List<GradeRule> rules,
                                       LocalDateTime publishedAt) {
        List<ResultSubject> resultSubjects = new ArrayList<>();
        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal earnedCredits = BigDecimal.ZERO;
        BigDecimal weightedPoints = BigDecimal.ZERO;
        boolean allPassed = true;

        for (ExamSubjectView subject : subjects) {
            MarkView mark = marks.get(subject.subjectId());
            String status = mark == null ? "ABSENT" : mark.status();
            BigDecimal obtained = mark == null ? null : mark.marksObtained();
            GradeInfo info = gradeInfo(obtained, subject.maxMarks(), status, rules, subject.passMarks());
            resultSubjects.add(new ResultSubject(
                    Ids.newId("rsub"),
                    subject.subjectId(),
                    subject.subjectCode(),
                    subject.subjectName(),
                    subject.credits(),
                    subject.maxMarks(),
                    obtained,
                    status,
                    info.grade(),
                    info.point(),
                    info.passed()));
            totalCredits = totalCredits.add(subject.credits());
            if (info.passed()) {
                earnedCredits = earnedCredits.add(subject.credits());
            } else {
                allPassed = false;
            }
            weightedPoints = weightedPoints.add(info.point().multiply(subject.credits()));
        }

        BigDecimal gpa = totalCredits.signum() == 0 ? BigDecimal.ZERO
                : weightedPoints.divide(totalCredits, 2, RoundingMode.HALF_UP);
        BigDecimal cgpa = overallCgpa(student.id(), exam.id(), gpa, totalCredits);

        return new SemesterResult(
                Ids.newId("res"),
                student.id(),
                student.fullName(),
                student.registerNumber(),
                exam.id(),
                exam.semester(),
                exam.academicYear(),
                totalCredits.setScale(1, RoundingMode.HALF_UP),
                earnedCredits.setScale(1, RoundingMode.HALF_UP),
                gpa,
                cgpa,
                allPassed ? "PASS" : "FAIL",
                publishedAt,
                resultSubjects);
    }

    private BigDecimal overallCgpa(String studentId, String excludeExamId,
                                   BigDecimal semesterGpa, BigDecimal semesterCredits) {
        BigDecimal weighted = semesterGpa.multiply(semesterCredits);
        BigDecimal credits = semesterCredits;
        for (SemesterResult result : examRepository.resultsForStudent(studentId)) {
            if (result.examId().equals(excludeExamId)) {
                continue;
            }
            weighted = weighted.add(result.semesterGpa().multiply(result.totalCredits()));
            credits = credits.add(result.totalCredits());
        }
        if (credits.signum() == 0) {
            return semesterGpa;
        }
        return weighted.divide(credits, 2, RoundingMode.HALF_UP);
    }

    private void updateArrears(Exam exam, StudentProfile student, SemesterResult result) {
        for (ResultSubject subject : result.subjects()) {
            if (subject.passed()) {
                examRepository.registeredArrearForSubject(student.id(), subject.subjectId())
                        .ifPresent(arrear -> examRepository.clearArrear(arrear.id(), exam.id(), subject.grade()));
            } else {
                boolean exists = examRepository.registeredArrearForSubject(student.id(), subject.subjectId()).isPresent();
                if (!exists) {
                    examRepository.insertArrear(Ids.newId("arr"), student.id(), subject.subjectId(),
                            exam.id(), subject.grade());
                }
            }
        }
    }

    private BigDecimal validateMarks(MarkEntryRequest entry, int maxMarks) {
        if (!"MARKS_ENTERED".equals(entry.status())) {
            return null;
        }
        if (entry.marksObtained() == null) {
            throw ApiException.badRequest("Marks are required for status MARKS_ENTERED.");
        }
        if (entry.marksObtained().signum() < 0
                || entry.marksObtained().compareTo(BigDecimal.valueOf(maxMarks)) > 0) {
            throw ApiException.badRequest("Marks must be between 0 and " + maxMarks + ".");
        }
        return entry.marksObtained();
    }

    private GradeInfo gradeInfo(BigDecimal marks, int maxMarks, String status,
                                List<GradeRule> rules, int passMarks) {
        if (!"MARKS_ENTERED".equals(status) || marks == null) {
            return new GradeInfo("RA", BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), false);
        }
        BigDecimal percentage = marks.multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(maxMarks), 2, RoundingMode.HALF_UP);
        for (GradeRule rule : rules) {
            if (percentage.compareTo(rule.minPercentage()) >= 0
                    && percentage.compareTo(rule.maxPercentage()) <= 0) {
                return new GradeInfo(rule.grade(), rule.gradePoint(),
                        marks.compareTo(BigDecimal.valueOf(passMarks)) >= 0);
            }
        }
        return new GradeInfo("RA", BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), false);
    }

    private void requireFacultyAssignment(String facultyId, ExamSubjectView subject) {
        boolean assigned = academicRepository.assignments(facultyId, null).stream()
                .map(FacultyAssignment::subjectId)
                .anyMatch(subject.subjectId()::equals);
        if (!assigned) {
            throw ApiException.forbidden("You are not assigned to this subject.");
        }
    }

    private List<String> userAdmins() {
        return userRepository.findAll("ADMIN", "ACTIVE", null).stream()
                .map(User::id)
                .toList();
    }

    private record GradeInfo(String grade, BigDecimal point, boolean passed) {
    }
}
