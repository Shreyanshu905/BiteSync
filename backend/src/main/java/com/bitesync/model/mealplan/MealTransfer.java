package com.bitesync.model.mealplan;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "mealtransfers")
public class MealTransfer {

    @Id
    private String id;

    @Indexed
    private String sender; // User ID

    @Indexed
    private String recipient; // User ID

    private String recipientStudentId;
    private Integer creditsCount = 1;
    private String mealCreditId; // MealCredit ID
    private String status = "completed"; // completed, rejected
    private String message = "";

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public MealTransfer() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getRecipientStudentId() {
        return recipientStudentId;
    }

    public void setRecipientStudentId(String recipientStudentId) {
        this.recipientStudentId = recipientStudentId;
    }

    public Integer getCreditsCount() {
        return creditsCount;
    }

    public void setCreditsCount(Integer creditsCount) {
        this.creditsCount = creditsCount;
    }

    public String getMealCreditId() {
        return mealCreditId;
    }

    public void setMealCreditId(String mealCreditId) {
        this.mealCreditId = mealCreditId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
