package com.bitesync.model.inventory;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Demonstrates OOPS:
 * - ENCAPSULATION: Protects raw material stock levels and records restock history.
 * - COMPOSITION: Contains embedded RestockHistory audit entries.
 */
@Document(collection = "inventoryitems")
public class InventoryItem {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String category = "grain"; // grain, dairy, vegetable, beverage, spice, packaging, other
    private Double currentStock = 50.0;
    private String unit = "kg"; // kg, litres, packets, units, grams
    private Double minThreshold = 15.0;
    private Double costPerUnit = 50.0;
    private String supplier = "Campus Mega Wholesale";
    private Date lastRestockedAt = new Date();
    private List<RestockHistory> restockHistory = new ArrayList<>();

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public InventoryItem() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public InventoryItem(String name, String category, Double currentStock, String unit, Double minThreshold) {
        this();
        this.name = name;
        this.category = category;
        this.currentStock = currentStock != null ? currentStock : 50.0;
        this.unit = unit != null ? unit : "kg";
        this.minThreshold = minThreshold != null ? minThreshold : 15.0;
    }

    // Domain Methods (Encapsulation)
    @JsonProperty("isLowStock")
    public boolean isLowStock() {
        return this.currentStock != null && this.minThreshold != null && this.currentStock <= this.minThreshold;
    }

    public void consume(double quantity) {
        if (this.currentStock != null) {
            this.currentStock = Math.max(0.0, this.currentStock - quantity);
        }
    }

    public void replenish(double quantity, double cost, String note) {
        if (this.currentStock == null) this.currentStock = 0.0;
        this.currentStock += quantity;
        this.lastRestockedAt = new Date();
        if (this.restockHistory == null) this.restockHistory = new ArrayList<>();
        this.restockHistory.add(new RestockHistory(quantity, cost, note));
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Double currentStock) {
        this.currentStock = currentStock;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getMinThreshold() {
        return minThreshold;
    }

    public void setMinThreshold(Double minThreshold) {
        this.minThreshold = minThreshold;
    }

    public Double getCostPerUnit() {
        return costPerUnit;
    }

    public void setCostPerUnit(Double costPerUnit) {
        this.costPerUnit = costPerUnit;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public Date getLastRestockedAt() {
        return lastRestockedAt;
    }

    public void setLastRestockedAt(Date lastRestockedAt) {
        this.lastRestockedAt = lastRestockedAt;
    }

    public List<RestockHistory> getRestockHistory() {
        return restockHistory;
    }

    public void setRestockHistory(List<RestockHistory> restockHistory) {
        this.restockHistory = restockHistory;
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
