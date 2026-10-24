package com.smartcampus.erp.exam;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExamSubjectView(
        String id,
        String examId,
        String subjectId,
        String subjectCode,
        String subjectName,
        BigDecimal credits,
        LocalDate examDate,
        int maxMarks,
        int passMarks) {
}
