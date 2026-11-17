package com.bitesync.model.user;

/**
 * Demonstrates OOPS:
 * - INHERITANCE: Inherits core user attributes.
 * - POLYMORPHISM: Overrides getIdentifier() and hasAdminPrivileges() returning true.
 */
public class Admin extends User {

    private String adminDepartment = "Canteen Management & Finance";
    private Boolean isSuperAdmin = true;

    public Admin() {
        super();
        setRole("admin");
    }

    public Admin(String name, String email, String password, String adminDepartment) {
        super(name, email, password, "admin");
        this.adminDepartment = adminDepartment;
    }

    @Override
    public String getIdentifier() {
        return "ADMIN-" + getEmail();
    }

    @Override
    public boolean hasAdminPrivileges() {
        return true;
    }

    @Override
    public String getDisplayRole() {
        return "Canteen Administrator";
    }

    public String getAdminDepartment() {
        return adminDepartment;
    }

    public void setAdminDepartment(String adminDepartment) {
        this.adminDepartment = adminDepartment;
    }

    public Boolean getIsSuperAdmin() {
        return isSuperAdmin;
    }

    public void setIsSuperAdmin(Boolean isSuperAdmin) {
        this.isSuperAdmin = isSuperAdmin;
    }
}
