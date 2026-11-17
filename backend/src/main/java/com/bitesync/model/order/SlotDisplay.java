package com.bitesync.model.order;

public class SlotDisplay {
    private String startTime;
    private String endTime;
    private String date;
    private String mealPeriod;

    public SlotDisplay() {}

    public SlotDisplay(String startTime, String endTime, String date, String mealPeriod) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.date = date;
        this.mealPeriod = mealPeriod;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getMealPeriod() {
        return mealPeriod;
    }

    public void setMealPeriod(String mealPeriod) {
        this.mealPeriod = mealPeriod;
    }
}
