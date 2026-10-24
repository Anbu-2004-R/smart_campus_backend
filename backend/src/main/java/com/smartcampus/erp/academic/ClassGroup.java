package com.smartcampus.erp.academic;

public record ClassGroup(
        String id,
        String name,
        String courseId,
        int semester,
        String section,
        String academicYear,
        int totalStudents) {
}
