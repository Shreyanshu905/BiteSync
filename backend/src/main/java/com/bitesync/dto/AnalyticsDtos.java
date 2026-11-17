package com.bitesync.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    public static class OverviewStatsDto {
        private Double todayRevenue = 0.0;
        private Long totalOrders = 0L;
        private Long pendingOrders = 0L;
        private Long completedOrders = 0L;
        private Long cancelledOrders = 0L;
        private Long activeStudents = 0L;
        private Long lowStockCount = 0L;

        public Double getTodayRevenue() { return todayRevenue; }
        public void setTodayRevenue(Double todayRevenue) { this.todayRevenue = todayRevenue; }
        public Long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
        public Long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }
        public Long getCompletedOrders() { return completedOrders; }
        public void setCompletedOrders(Long completedOrders) { this.completedOrders = completedOrders; }
        public Long getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(Long cancelledOrders) { this.cancelledOrders = cancelledOrders; }
        public Long getActiveStudents() { return activeStudents; }
        public void setActiveStudents(Long activeStudents) { this.activeStudents = activeStudents; }
        public Long getLowStockCount() { return lowStockCount; }
        public void setLowStockCount(Long lowStockCount) { this.lowStockCount = lowStockCount; }
    }

    public static class SalesTrendDto {
        private String date;
        private Double revenue;
        private Long orders;

        public SalesTrendDto() {}
        public SalesTrendDto(String date, Double revenue, Long orders) {
            this.date = date;
            this.revenue = revenue;
            this.orders = orders;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Double getRevenue() { return revenue; }
        public void setRevenue(Double revenue) { this.revenue = revenue; }
        public Long getOrders() { return orders; }
        public void setOrders(Long orders) { this.orders = orders; }
    }
}
