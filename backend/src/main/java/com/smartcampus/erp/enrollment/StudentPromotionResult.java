package com.smartcampus.erp.enrollment;

public record StudentPromotionResult(
        StudentEnrollment enrollment,
        boolean graduated,
        String message) {
}
