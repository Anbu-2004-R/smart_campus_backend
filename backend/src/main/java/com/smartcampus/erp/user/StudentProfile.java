package com.smartcampus.erp.user;

import java.time.LocalDate;

public record StudentProfile(
        String id,
        String userId,
        String registerNumber,
        String fullName,
        String departmentId,
        String courseId,
        int currentSemester,
        String academicYear,
        String email,
        String phone,
        LocalDate dateOfBirth,
        String avatarUrl,
        String classGroupId) {
}
