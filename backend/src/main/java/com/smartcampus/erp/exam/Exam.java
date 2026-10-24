package com.smartcampus.erp.exam;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record Exam(
        String id,
        String name,
        String code,
        String academicYear,
        int semester,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        LocalDateTime publishedAt,
        String publishedBy,
        List<ExamSubjectView> subjects) {
}
