package com.smartcampus.erp.enrollment;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StudentEnrollment(
        String id,
        String studentId,
        String registerNumber,
        String studentName,
        String courseId,
        String courseName,
        String departmentId,
        String departmentCode,
        String academicYear,
        int semester,
        String classGroupId,
        String classGroupName,
        LocalDate enrollmentDate,
        String status,
        BigDecimal creditsRegistered,
        String remarks) {
}
