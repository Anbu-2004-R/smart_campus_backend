package com.smartcampus.erp.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ComplaintCreateRequest(
        @NotBlank(message = "Title is required.")
        @Size(min = 5, max = 180, message = "Title must be between 5 and 180 characters.") String title,
        @NotBlank(message = "Description is required.")
        @Size(min = 20, max = 4000, message = "Description must be between 20 and 4000 characters.") String description,
        @NotBlank(message = "Category is required.")
        @Pattern(regexp = "INFRASTRUCTURE|ACADEMIC|HOSTEL|ATTENDANCE|EXAMINATION|TRANSPORT|OTHER",
                message = "Invalid complaint category.") String category,
        @NotBlank(message = "Priority is required.")
        @Pattern(regexp = "LOW|MEDIUM|HIGH|URGENT", message = "Invalid priority.") String requestedPriority) {
}
