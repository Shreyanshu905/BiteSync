package com.bitesync.model.slot;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * Demonstrates OOPS:
 * - ENCAPSULATION: Enforces slot booking capacity and prevents overbooking concurrency.
 */
@Document(collection = "pickupslots")
@CompoundIndex(def = "{'date': 1, 'mealPeriod': 1, 'startTime': 1}", unique = true)
public class PickupSlot {

    @Id
    private String id;

    private String startTime; // e.g. "08:00"
    private String endTime;   // e.g. "08:15"
    private String mealPeriod;// breakfast, lunch, snacks, dinner, late-night
    private String date;      // YYYY-MM-DD
    private Integer maxCapacity = 20;
    private Integer currentBookings = 0;
    private Boolean isClosed = false;
    private String closureReason = "";

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public PickupSlot() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public PickupSlot(String startTime, String endTime, String mealPeriod, String date, Integer maxCapacity) {
        this();
        this.startTime = startTime;
        this.endTime = endTime;
        this.mealPeriod = mealPeriod;
        this.date = date;
        this.maxCapacity = maxCapacity != null ? maxCapacity : 20;
    }

    // Domain Methods (Encapsulation)
    public boolean hasAvailableCapacity() {
        return !Boolean.TRUE.equals(this.isClosed) && (this.currentBookings == null || this.currentBookings < this.maxCapacity);
    }

    @JsonProperty("remainingCapacity")
    public int getRemainingCapacity() {
        if (this.maxCapacity == null) return 0;
        int current = this.currentBookings != null ? this.currentBookings : 0;
        return Math.max(0, this.maxCapacity - current);
    }

    public void bookSlot() {
        if (!hasAvailableCapacity()) {
            throw new IllegalStateException("Slot " + startTime + "-" + endTime + " is full or closed.");
        }
        this.currentBookings = (this.currentBookings != null ? this.currentBookings : 0) + 1;
    }

    public void releaseSlot() {
        if (this.currentBookings != null && this.currentBookings > 0) {
            this.currentBookings--;
        }
    }

    public void closeSlot(String reason) {
        this.isClosed = true;
        this.closureReason = reason != null ? reason : "Slot closed by kitchen staff";
    }

    public void reopenSlot() {
        this.isClosed = false;
        this.closureReason = "";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getMealPeriod() {
        return mealPeriod;
    }

    public void setMealPeriod(String mealPeriod) {
        this.mealPeriod = mealPeriod;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public Integer getCurrentBookings() {
        return currentBookings;
    }

    public void setCurrentBookings(Integer currentBookings) {
        this.currentBookings = currentBookings;
    }

    public Boolean getIsClosed() {
        return isClosed;
    }

    public void setIsClosed(Boolean closed) {
        isClosed = closed;
    }

    public String getClosureReason() {
        return closureReason;
    }

    public void setClosureReason(String closureReason) {
        this.closureReason = closureReason;
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
