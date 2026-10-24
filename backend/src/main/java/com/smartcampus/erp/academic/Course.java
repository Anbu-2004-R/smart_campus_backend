package com.smartcampus.erp.academic;

public record Course(
        String id,
        String code,
        String name,
        String departmentId,
        int totalSemesters,
        String degreeType) {
}
