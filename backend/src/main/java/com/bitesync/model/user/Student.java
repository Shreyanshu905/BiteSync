package com.bitesync.model.user;

/**
 * Demonstrates OOPS:
 * - INHERITANCE: Inherits identity, credentials, and lifecycle fields from User.
 * - COMPOSITION/AGGREGATION: Contains HostelDetails as a structured object.
 * - POLYMORPHISM: Overrides getIdentifier(), hasAdminPrivileges(), and getDisplayRole().
 */
public class Student extends User {

    private String studentId;
    private HostelDetails hostel;
    private String dietaryPreference = "all";

    public Student() {
        super();
        setRole("student");
        this.hostel = new HostelDetails();
    }

    public Student(String name, String email, String password, String studentId, HostelDetails hostel) {
        super(name, email, password, "student");
        this.studentId = studentId != null ? studentId.toUpperCase() : null;
        this.hostel = hostel != null ? hostel : new HostelDetails();
    }

    @Override
    public String getIdentifier() {
        return studentId != null ? studentId : getEmail();
    }

    @Override
    public boolean hasAdminPrivileges() {
        return false;
    }

    @Override
    public String getDisplayRole() {
        return "Hostel Student";
    }

    public void updateHostelMapping(String hostelName, String block, String roomNumber) {
        if (this.hostel == null) {
            this.hostel = new HostelDetails();
        }
        if (hostelName != null && !hostelName.trim().isEmpty()) this.hostel.setHostelName(hostelName);
        if (block != null && !block.trim().isEmpty()) this.hostel.setBlock(block);
        if (roomNumber != null && !roomNumber.trim().isEmpty()) this.hostel.setRoomNumber(roomNumber);
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId != null ? studentId.toUpperCase() : null;
    }

    public HostelDetails getHostel() {
        return hostel;
    }

    public void setHostel(HostelDetails hostel) {
        this.hostel = hostel;
    }

    public String getDietaryPreference() {
        return dietaryPreference;
    }

    public void setDietaryPreference(String dietaryPreference) {
        this.dietaryPreference = dietaryPreference;
    }
}
