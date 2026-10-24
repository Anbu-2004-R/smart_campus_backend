package com.smartcampus.erp.academic;

public record FacultyAssignment(
        String id,
        String facultyId,
        String subjectId,
        String classGroupId,
        String academicYear,
        int semester) {
}
