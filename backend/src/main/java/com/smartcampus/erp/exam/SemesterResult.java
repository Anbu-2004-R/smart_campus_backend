package com.smartcampus.erp.exam;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SemesterResult(
        String id,
        String studentId,
        String studentName,
        String registerNumber,
        String examId,
        int semester,
        String academicYear,
        BigDecimal totalCredits,
        BigDecimal earnedCredits,
        BigDecimal semesterGpa,
        BigDecimal overallCgpa,
        String overallResult,
        LocalDateTime publishedAt,
        List<ResultSubject> subjects) {

    public SemesterResult withSubjects(List<ResultSubject> newSubjects) {
        return new SemesterResult(id, studentId, studentName, registerNumber, examId, semester, academicYear,
                totalCredits, earnedCredits, semesterGpa, overallCgpa, overallResult, publishedAt, newSubjects);
    }
}
