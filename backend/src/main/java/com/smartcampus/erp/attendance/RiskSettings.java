package com.smartcampus.erp.attendance;

import java.math.BigDecimal;

public record RiskSettings(
        String id,
        BigDecimal highRiskThreshold,
        BigDecimal mediumRiskThreshold,
        int recentAbsenceTrendDays,
        int warningConsecutiveAbsences) {
}
