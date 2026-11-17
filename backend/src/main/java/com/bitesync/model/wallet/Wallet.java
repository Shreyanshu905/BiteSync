package com.bitesync.model.wallet;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * Demonstrates OOPS:
 * - ENCAPSULATION: Enforces balance non-negativity and atomic balance transitions.
 * - AGGREGATION: Associated with Student entity via student User ID.
 */
@Document(collection = "wallets")
public class Wallet {

    @Id
    private String id;

    @Indexed(unique = true)
    @org.springframework.data.mongodb.core.mapping.Field(targetType = org.springframework.data.mongodb.core.mapping.FieldType.OBJECT_ID)
    private String student; // User ID

    private Double balance = 500.0;
    private String currency = "INR";
    private Boolean isActive = true;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Wallet() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public Wallet(String student, Double balance) {
        this();
        this.student = student;
        this.balance = balance != null ? balance : 500.0;
    }

    // Domain Methods (Encapsulation)
    public boolean hasSufficientBalance(double requiredAmount) {
        return Boolean.TRUE.equals(this.isActive) && this.balance != null && this.balance >= requiredAmount;
    }

    public void credit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Credit amount must be greater than zero.");
        }
        if (this.balance == null) this.balance = 0.0;
        this.balance += amount;
    }

    public void deduct(double amount) {
        if (!hasSufficientBalance(amount)) {
            throw new IllegalStateException("Insufficient wallet balance. Available: ₹" + this.balance + ", Required: ₹" + amount);
        }
        this.balance -= amount;
    }

    // Getters and Setters
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

    public String getStudent() {
        return student;
    }

    public void setStudent(String student) {
        this.student = student;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        if (balance != null && balance < 0) {
            throw new IllegalArgumentException("Wallet balance cannot be negative.");
        }
        this.balance = balance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
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
