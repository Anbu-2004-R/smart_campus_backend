package com.smartcampus.erp.user;

public record FacultyProfile(
        String id,
        String userId,
        String employeeId,
        String fullName,
        String departmentId,
        String email,
        String phone,
        String designation,
        String avatarUrl) {
}
