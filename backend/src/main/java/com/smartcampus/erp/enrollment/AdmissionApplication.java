package com.smartcampus.erp.enrollment;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdmissionApplication(
        String id,
        String applicationNumber,
        String applicantName,
        String email,
        String phone,
        LocalDate dateOfBirth,
        String departmentId,
        String departmentCode,
        String departmentName,
        String courseId,
        String courseName,
        int appliedSemester,
        String academicYear,
        String previousQualification,
        String percentageOrGpa,
        String status,
        LocalDateTime submittedAt,
        String reviewedBy,
        LocalDateTime reviewedAt,
        String reviewRemarks,
        String assignedClassGroupId,
        String generatedRegisterNumber) {
}
