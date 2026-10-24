package com.smartcampus.erp.enrollment;

public record AdmissionDecisionResponse(
        AdmissionApplication application,
        String activationToken) {
}
