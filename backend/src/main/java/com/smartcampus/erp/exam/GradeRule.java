package com.smartcampus.erp.exam;

import java.math.BigDecimal;

public record GradeRule(
        String grade,
        BigDecimal minPercentage,
        BigDecimal maxPercentage,
        BigDecimal gradePoint,
        String description) {
}
