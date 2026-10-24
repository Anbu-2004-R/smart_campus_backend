package com.smartcampus.erp.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record InviteRequest(
        @NotBlank(message = "Role is required.")
        @Pattern(regexp = "FACULTY|STUDENT", message = "Role must be FACULTY or STUDENT.") String role,
        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.") String email,
        @NotBlank(message = "Full name is required.") String name,
        String registerNumber,
        String employeeId,
        String departmentId,
        String courseId,
        String classGroupId,
        @Min(value = 1, message = "Semester must be at least 1.")
        @Max(value = 12, message = "Semester must be at most 12.") Integer semester,
        @Pattern(regexp = "^$|\\d{4}-\\d{4}", message = "Academic year must use the YYYY-YYYY format.")
        String academicYear,
        String phone,
        String designation) {
}
