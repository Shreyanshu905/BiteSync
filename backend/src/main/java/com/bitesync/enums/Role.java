package com.bitesync.enums;

public enum Role {
    STUDENT("student"),
    ADMIN("admin"),
    KITCHEN("kitchen");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromString(String text) {
        for (Role r : Role.values()) {
            if (r.value.equalsIgnoreCase(text) || r.name().equalsIgnoreCase(text)) {
                return r;
            }
        }
        return STUDENT;
    }
}
