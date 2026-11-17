package com.bitesync.model.mealplan;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "mealplans")
public class MealPlan {

    @Id
    private String id;

    private String name;
    private String description;
    private String planType = "weekly"; // weekly, monthly, credit_bundle
    private Integer durationDays = 7;
    private Integer mealCreditsCount = 14;
    private Double price;
    private String savingsText = "Save 20%";
    private List<String> allowedMealTypes = new ArrayList<>();
    private Boolean isActive = true;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public MealPlan() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public String getId() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getMealCreditsCount() {
        return mealCreditsCount;
    }

    public void setMealCreditsCount(Integer mealCreditsCount) {
        this.mealCreditsCount = mealCreditsCount;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getSavingsText() {
        return savingsText;
    }

    public void setSavingsText(String savingsText) {
        this.savingsText = savingsText;
    }

    public List<String> getAllowedMealTypes() {
        return allowedMealTypes;
    }

    public void setAllowedMealTypes(List<String> allowedMealTypes) {
        this.allowedMealTypes = allowedMealTypes;
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
