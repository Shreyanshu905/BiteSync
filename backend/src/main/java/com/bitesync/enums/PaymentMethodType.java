package com.bitesync.enums;

public enum PaymentMethodType {
    WALLET("wallet"),
    UPI("upi"),
    DEMO_GATEWAY("demo_gateway"),
    MEAL_CREDIT("meal_credit");

    private final String value;

    PaymentMethodType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentMethodType fromString(String text) {
        for (PaymentMethodType p : PaymentMethodType.values()) {
            if (p.value.equalsIgnoreCase(text) || p.name().equalsIgnoreCase(text)) {
                return p;
            }
        }
        return WALLET;
    }
}
