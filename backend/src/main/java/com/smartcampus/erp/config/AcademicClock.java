package com.smartcampus.erp.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.stereotype.Component;

/**
 * Central source for "today" so the demo behaves consistently with the academic calendar.
 * Set APP_ACADEMIC_DATE to an empty value to use the real system date.
 */
@Component
public class AcademicClock {
    private final LocalDate fixedDate;

    public AcademicClock(AppProperties properties) {
        String configured = properties.academic() == null ? null : properties.academic().fixedDate();
        this.fixedDate = (configured == null || configured.isBlank()) ? null : LocalDate.parse(configured);
    }

    public LocalDate today() {
        return fixedDate != null ? fixedDate : LocalDate.now();
    }

    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
