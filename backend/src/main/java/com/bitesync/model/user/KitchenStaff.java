package com.bitesync.model.user;

/**
 * Demonstrates OOPS:
 * - INHERITANCE: Inherits core user attributes.
 * - POLYMORPHISM: Overrides getIdentifier() and getDisplayRole().
 */
public class KitchenStaff extends User {

    private String assignedStation = "Main Prep Counter";
    private String shiftTiming = "07:00 - 22:00";

    public KitchenStaff() {
        super();
        setRole("kitchen");
    }

    public KitchenStaff(String name, String email, String password, String assignedStation) {
        super(name, email, password, "kitchen");
        this.assignedStation = assignedStation;
    }

    @Override
    public String getIdentifier() {
        return "STAFF-" + (assignedStation != null ? assignedStation : "KITCHEN");
    }

    @Override
    public boolean hasAdminPrivileges() {
        return false;
    }

    @Override
    public String getDisplayRole() {
        return "Kitchen Operations Staff";
    }

    public String getAssignedStation() {
        return assignedStation;
    }

    public void setAssignedStation(String assignedStation) {
        this.assignedStation = assignedStation;
    }

    public String getShiftTiming() {
        return shiftTiming;
    }

    public void setShiftTiming(String shiftTiming) {
        this.shiftTiming = shiftTiming;
    }
}
