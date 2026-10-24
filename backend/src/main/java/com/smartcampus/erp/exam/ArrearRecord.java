package com.smartcampus.erp.exam;

public record ArrearRecord(
        String id,
        String studentId,
        String subjectId,
        String subjectCode,
        String subjectName,
        String originalExamId,
        String originalGrade,
        String clearedInExamId,
        String clearedGrade,
        String status) {
}
