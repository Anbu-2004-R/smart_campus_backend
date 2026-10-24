package com.smartcampus.erp.auth;

import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.config.AppProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();
    private final AppProperties properties;

    public JwtService(AppProperties properties) {
        this.properties = properties;
    }

    public String issue(String userId, String role, String loginId, String name) {
        long now = Instant.now().getEpochSecond();
        long expiry = now + (properties.jwt().ttlMinutes() * 60);
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String encodedName = URL_ENCODER.encodeToString(
                (name == null ? "" : name).getBytes(StandardCharsets.UTF_8));
        String payload = "{"
                + "\"sub\":\"" + escape(userId) + "\","
                + "\"role\":\"" + escape(role) + "\","
                + "\"loginId\":\"" + escape(loginId) + "\","
                + "\"nm\":\"" + encodedName + "\","
                + "\"iat\":" + now + ","
                + "\"exp\":" + expiry + ","
                + "\"iss\":\"" + escape(properties.jwt().issuer()) + "\""
                + "}";
        String encodedHeader = URL_ENCODER.encodeToString(header.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = URL_ENCODER.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signingInput = encodedHeader + "." + encodedPayload;
        return signingInput + "." + sign(signingInput);
    }

    public AuthPrincipal parse(String token) {
        if (token == null || token.isBlank()) {
            throw ApiException.unauthorized("Missing authentication token.");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        String expected = sign(parts[0] + "." + parts[1]);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        String payload;
        try {
            payload = new String(URL_DECODER.decode(parts[1]), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        long expiry;
        try {
            expiry = Long.parseLong(number(payload, "exp"));
        } catch (NumberFormatException ex) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        if (Instant.now().getEpochSecond() >= expiry) {
            throw ApiException.unauthorized("Your session has expired. Please sign in again.");
        }
        String issuer = string(payload, "iss");
        if (issuer == null || !issuer.equals(properties.jwt().issuer())) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        String name = "";
        String encodedName = string(payload, "nm");
        if (encodedName != null && !encodedName.isBlank()) {
            try {
                name = new String(URL_DECODER.decode(encodedName), StandardCharsets.UTF_8);
            } catch (IllegalArgumentException ignored) {
                name = "";
            }
        }
        return new AuthPrincipal(
                requiredString(payload, "sub"),
                requiredString(payload, "role"),
                requiredString(payload, "loginId"),
                name);
    }

    private String sign(String input) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.jwt().secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return URL_ENCODER.encodeToString(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign authentication token.", ex);
        }
    }

    private static String string(String json, String key) {
        Matcher matcher = Pattern.compile("\"" + Pattern.quote(key) + "\":\"([^\"]*)\"").matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    private static String requiredString(String json, String key) {
        String value = string(json, key);
        if (value == null) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        return value;
    }

    private static String number(String json, String key) {
        Matcher matcher = Pattern.compile("\"" + Pattern.quote(key) + "\":(\\d+)").matcher(json);
        if (!matcher.find()) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        return matcher.group(1);
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
