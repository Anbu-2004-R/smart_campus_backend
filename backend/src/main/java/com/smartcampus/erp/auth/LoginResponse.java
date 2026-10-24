package com.smartcampus.erp.auth;

import com.smartcampus.erp.user.FacultyProfile;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.User;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        User user,
        StudentProfile studentProfile,
        FacultyProfile facultyProfile) {
}
