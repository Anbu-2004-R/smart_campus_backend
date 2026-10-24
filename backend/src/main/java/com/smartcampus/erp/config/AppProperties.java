package com.smartcampus.erp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Cors cors,
        Academic academic,
        Demo demo) {

    public record Jwt(String secret, long ttlMinutes, String issuer) {
    }

    public record Cors(String allowedOrigins) {
    }

    public record Academic(String fixedDate) {
    }

    public record Demo(boolean enabled) {
    }
}
