package com.bitesync.enums;

public enum OrderStatus {
    PLACED("placed"),
    ACCEPTED("accepted"),
    PREPARING("preparing"),
    READY("ready"),
    COLLECTED("collected"),
    CANCELLED("cancelled");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OrderStatus fromString(String text) {
        for (OrderStatus s : OrderStatus.values()) {
            if (s.value.equalsIgnoreCase(text) || s.name().equalsIgnoreCase(text)) {
                return s;
            }
        }
        return PLACED;
    }
}
