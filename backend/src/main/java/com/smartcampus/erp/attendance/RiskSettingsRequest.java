package com.smartcampus.erp.attendance;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RiskSettingsRequest(
        @NotNull(message = "High risk threshold is required.")
        @DecimalMin(value = "0.0", message = "High risk threshold must be at least 0.")
        @DecimalMax(value = "100.0", message = "High risk threshold must be at most 100.") BigDecimal highRiskThreshold,
        @NotNull(message = "Medium risk threshold is required.")
        @DecimalMin(value = "0.0", message = "Medium risk threshold must be at least 0.")
        @DecimalMax(value = "100.0", message = "Medium risk threshold must be at most 100.") BigDecimal mediumRiskThreshold,
        @Min(value = 1, message = "Trend days must be at least 1.")
        @Max(value = 90, message = "Trend days must be at most 90.") int recentAbsenceTrendDays,
        @Min(value = 1, message = "Warning threshold must be at least 1.")
        @Max(value = 30, message = "Warning threshold must be at most 30.") int warningConsecutiveAbsences) {
}
