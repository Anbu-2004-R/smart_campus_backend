package com.smartcampus.erp.academic;

public record Department(
        String id,
        String code,
        String name,
        String hodName,
        int facultyCount,
        int studentCount) {
}
