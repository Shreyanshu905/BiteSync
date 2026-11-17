package com.bitesync.enums;

public enum PaymentStatus {
    PENDING("pending"),
    COMPLETED("completed"),
    REFUNDED("refunded"),
    FAILED("failed");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentStatus fromString(String text) {
        for (PaymentStatus s : PaymentStatus.values()) {
            if (s.value.equalsIgnoreCase(text) || s.name().equalsIgnoreCase(text)) {
                return s;
            }
        }
        return COMPLETED;
    }
}
