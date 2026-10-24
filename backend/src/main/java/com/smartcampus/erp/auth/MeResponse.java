package com.smartcampus.erp.auth;

import com.smartcampus.erp.user.FacultyProfile;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.User;

public record MeResponse(
        User user,
        StudentProfile studentProfile,
        FacultyProfile facultyProfile,
        long unreadNotifications) {
}
