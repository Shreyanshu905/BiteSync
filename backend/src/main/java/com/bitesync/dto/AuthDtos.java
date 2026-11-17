package com.bitesync.dto;

import com.bitesync.model.user.HostelDetails;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String studentId;
        private HostelDetails hostel;
        private String phone;
        private String dietaryPreference = "all";

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public HostelDetails getHostel() { return hostel; }
        public void setHostel(HostelDetails hostel) { this.hostel = hostel; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDietaryPreference() { return dietaryPreference; }
        public void setDietaryPreference(String dietaryPreference) { this.dietaryPreference = dietaryPreference; }
    }

    public static class ProfileUpdateRequest {
        private String name;
        private String phone;
        private HostelDetails hostel;
        private String dietaryPreference;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public HostelDetails getHostel() { return hostel; }
        public void setHostel(HostelDetails hostel) { this.hostel = hostel; }
        public String getDietaryPreference() { return dietaryPreference; }
        public void setDietaryPreference(String dietaryPreference) { this.dietaryPreference = dietaryPreference; }
    }

    public static class UserProfileDto {
        private String id;
        private String name;
        private String email;
        private String role;
        private String studentId;
        private HostelDetails hostel;
        private String phone;
        private String dietaryPreference;
        private Double walletBalance = 0.0;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        @com.fasterxml.jackson.annotation.JsonProperty("_id")
        public String get_id() { return id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public HostelDetails getHostel() { return hostel; }
        public void setHostel(HostelDetails hostel) { this.hostel = hostel; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDietaryPreference() { return dietaryPreference; }
        public void setDietaryPreference(String dietaryPreference) { this.dietaryPreference = dietaryPreference; }
        public Double getWalletBalance() { return walletBalance; }
        public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }
    }
}
