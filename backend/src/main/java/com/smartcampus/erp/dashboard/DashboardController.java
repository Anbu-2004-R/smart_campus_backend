package com.smartcampus.erp.dashboard;

import com.smartcampus.erp.auth.RequireRole;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    @RequireRole("ADMIN")
    public AdminDashboard admin() {
        return dashboardService.admin();
    }

    @GetMapping("/faculty")
    @RequireRole("FACULTY")
    public FacultyDashboard faculty() {
        return dashboardService.faculty();
    }

    @GetMapping("/student")
    @RequireRole("STUDENT")
    public StudentDashboard student() {
        return dashboardService.student();
    }
}
