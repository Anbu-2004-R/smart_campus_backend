package com.smartcampus.erp.common;

import java.util.UUID;

public final class Ids {
    private Ids() {
    }

    public static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "");
    }
}
