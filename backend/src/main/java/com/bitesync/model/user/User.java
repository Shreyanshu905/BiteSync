package com.bitesync.model.user;

import com.bitesync.enums.Role;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * Demonstrates OOPS:
 * - ABSTRACTION: Defines common attributes and contract for all actors in BiteSync.
 * - ENCAPSULATION: All fields are private with controlled getters/setters and domain mutators.
 * - INHERITANCE BASE: Extended by Student, Admin, and KitchenStaff.
 */
@Document(collection = "users")
public abstract class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String role; // "student", "admin", "kitchen"

    private String phone;

    private String avatar = "";

    private Boolean isActive = true;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public User() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public User(String name, String email, String password, String role) {
        this();
        this.name = name;
        this.email = email != null ? email.toLowerCase() : null;
        this.password = password;
        this.role = role;
    }

    // Abstract contract to be implemented by concrete subclasses (Polymorphism)
    public abstract String getIdentifier();

    public abstract boolean hasAdminPrivileges();

    public abstract String getDisplayRole();

    // Domain Business Methods
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public boolean isAccountActive() {
        return Boolean.TRUE.equals(this.isActive);
    }

    public Role getRoleEnum() {
        return Role.fromString(this.role);
    }

    // Encapsulated Getters and Setters
    public String getId() {
        return id;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase() : null;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
