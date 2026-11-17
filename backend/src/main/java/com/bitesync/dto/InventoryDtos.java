package com.bitesync.dto;

public class InventoryDtos {

    public static class CreateInventoryRequest {
        private String name;
        private String category = "grain";
        private Double currentStock = 50.0;
        private String unit = "kg";
        private Double minThreshold = 15.0;
        private Double costPerUnit = 50.0;
        private String supplier;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Double getCurrentStock() { return currentStock; }
        public void setCurrentStock(Double currentStock) { this.currentStock = currentStock; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public Double getMinThreshold() { return minThreshold; }
        public void setMinThreshold(Double minThreshold) { this.minThreshold = minThreshold; }
        public Double getCostPerUnit() { return costPerUnit; }
        public void setCostPerUnit(Double costPerUnit) { this.costPerUnit = costPerUnit; }
        public String getSupplier() { return supplier; }
        public void setSupplier(String supplier) { this.supplier = supplier; }
    }

    public static class RestockRequest {
        private Double quantity;
        private Double cost;
        private String note;

        public Double getQuantity() { return quantity; }
        public void setQuantity(Double quantity) { this.quantity = quantity; }
        public Double getCost() { return cost; }
        public void setCost(Double cost) { this.cost = cost; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }
}
