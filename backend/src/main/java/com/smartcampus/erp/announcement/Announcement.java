package com.smartcampus.erp.announcement;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record Announcement(
        String id,
        String title,
        String content,
        String authorId,
        String authorName,
        String scope,
        String targetDepartmentId,
        String targetCourseId,
        Integer targetSemester,
        String priority,
        LocalDateTime publishedAt,
        LocalDate expiryDate) {
}
