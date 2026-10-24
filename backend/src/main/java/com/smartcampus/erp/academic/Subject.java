package com.smartcampus.erp.academic;

import java.math.BigDecimal;

public record Subject(
        String id,
        String code,
        String name,
        String courseId,
        int semester,
        BigDecimal credits,
        int maxMarks,
        int passMarks,
        String type) {
}
