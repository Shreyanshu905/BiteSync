package com.bitesync.enums;

public enum MealPeriod {
    BREAKFAST("breakfast"),
    LUNCH("lunch"),
    SNACKS("snacks"),
    DINNER("dinner"),
    LATE_NIGHT("late-night");

    private final String value;

    MealPeriod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static MealPeriod fromString(String text) {
        for (MealPeriod m : MealPeriod.values()) {
            if (m.value.equalsIgnoreCase(text) || m.name().equalsIgnoreCase(text)) {
                return m;
            }
        }
        return LUNCH;
    }
}
