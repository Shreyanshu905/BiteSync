package com.bitesync.dto;

public class SlotDtos {

    public static class CreateSlotRequest {
        private String startTime;
        private String endTime;
        private String mealPeriod;
        private String date;
        private Integer maxCapacity = 20;

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public String getMealPeriod() { return mealPeriod; }
        public void setMealPeriod(String mealPeriod) { this.mealPeriod = mealPeriod; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    }

    public static class UpdateSlotRequest {
        private Integer maxCapacity;
        private Boolean isClosed;
        private String closureReason;

        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
        public Boolean getIsClosed() { return isClosed; }
        public void setIsClosed(Boolean closed) { isClosed = closed; }
        public String getClosureReason() { return closureReason; }
        public void setClosureReason(String closureReason) { this.closureReason = closureReason; }
    }
}
