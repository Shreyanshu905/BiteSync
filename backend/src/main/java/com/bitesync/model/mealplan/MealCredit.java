package com.bitesync.model.mealplan;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "mealcredits")
@CompoundIndex(def = "{'student': 1, 'isActive': 1}")
public class MealCredit {

    @Id
    private String id;

    @Indexed
    private String student; // User ID

    private String mealPlan; // MealPlan ID
    private Integer totalCredits;
    private Integer remainingCredits;
    private Date validUntil;
    private Boolean isActive = true;

    public static class RedemptionRecord {
        private String orderId;
        private String mealPeriod;
        private Date redeemedAt = new Date();

        public RedemptionRecord() {}
        public RedemptionRecord(String orderId, String mealPeriod) {
            this.orderId = orderId;
            this.mealPeriod = mealPeriod;
            this.redeemedAt = new Date();
        }

        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getMealPeriod() { return mealPeriod; }
        public void setMealPeriod(String mealPeriod) { this.mealPeriod = mealPeriod; }
        public Date getRedeemedAt() { return redeemedAt; }
        public void setRedeemedAt(Date redeemedAt) { this.redeemedAt = redeemedAt; }
    }

    private List<RedemptionRecord> redemptionHistory = new ArrayList<>();

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public MealCredit() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public boolean hasAvailableCredits() {
        return Boolean.TRUE.equals(this.isActive) && this.remainingCredits != null && this.remainingCredits > 0
                && (this.validUntil == null || this.validUntil.after(new Date()));
    }

    public void redeem(String orderId, String mealPeriod) {
        if (!hasAvailableCredits()) {
            throw new IllegalStateException("No active meal plan credits available.");
        }
        this.remainingCredits--;
        if (this.redemptionHistory == null) this.redemptionHistory = new ArrayList<>();
        this.redemptionHistory.add(new RedemptionRecord(orderId, mealPeriod));
    }

    public String getId() {
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

    public String getMealPlan() {
        return mealPlan;
    }

    public void setMealPlan(String mealPlan) {
        this.mealPlan = mealPlan;
    }

    public Integer getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(Integer totalCredits) {
        this.totalCredits = totalCredits;
    }

    public Integer getRemainingCredits() {
        return remainingCredits;
    }

    public void setRemainingCredits(Integer remainingCredits) {
        this.remainingCredits = remainingCredits;
    }

    public Date getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(Date validUntil) {
        this.validUntil = validUntil;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public List<RedemptionRecord> getRedemptionHistory() {
        return redemptionHistory;
    }

    public void setRedemptionHistory(List<RedemptionRecord> redemptionHistory) {
        this.redemptionHistory = redemptionHistory;
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
