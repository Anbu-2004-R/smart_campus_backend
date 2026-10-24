package com.smartcampus.erp.enrollment;

import java.util.List;

public record PromotionResult(
        int promoted,
        int graduated,
        int skipped,
        List<StudentEnrollment> enrollments,
        List<String> messages) {
}
