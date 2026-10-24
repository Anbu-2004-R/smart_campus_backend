package com.smartcampus.erp.academic;

public record Classroom(
        String id,
        String roomNumber,
        String building,
        int floor,
        int capacity,
        String type) {
}
