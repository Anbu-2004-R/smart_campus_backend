package com.smartcampus.erp.exam;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MarkView(
        String id,
        String examId,
        String subjectId,
        String studentId,
        String registerNumber,
        String studentName,
        String status,
        BigDecimal marksObtained,
        String grade,
        BigDecimal gradePoint,
        Boolean passed,
        String enteredByFacultyId,
        LocalDateTime lastUpdated) {
}
