package com.smartcampus.erp.enrollment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public record AdmissionCreateRequest(
        @NotBlank(message = "Applicant name is required.") String applicantName,
        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.") String email,
        String phone,
        @Past(message = "Date of birth must be in the past.") LocalDate dateOfBirth,
        @NotBlank(message = "Department is required.") String departmentId,
        @NotBlank(message = "Course is required.") String courseId,
        @Min(value = 1, message = "Applied semester must be at least 1.")
        @Max(value = 12, message = "Applied semester must be at most 12.") int appliedSemester,
        @NotBlank(message = "Academic year is required.")
        @Pattern(regexp = "\\d{4}-\\d{4}", message = "Academic year must use the YYYY-YYYY format.")
        String academicYear,
        @NotBlank(message = "Previous qualification is required.") String previousQualification,
        @NotBlank(message = "Percentage or GPA is required.") String percentageOrGpa) {
}
