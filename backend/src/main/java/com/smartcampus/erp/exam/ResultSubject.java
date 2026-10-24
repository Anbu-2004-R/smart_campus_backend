package com.smartcampus.erp.exam;

import java.math.BigDecimal;

public record ResultSubject(
        String id,
        String subjectId,
        String subjectCode,
        String subjectName,
        BigDecimal credits,
        int maxMarks,
        BigDecimal marksObtained,
        String status,
        String grade,
        BigDecimal gradePoint,
        boolean passed) {
}
