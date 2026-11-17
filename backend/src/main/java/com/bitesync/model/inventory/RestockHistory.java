package com.bitesync.model.inventory;

import java.util.Date;

public class RestockHistory {
    private Double quantity;
    private Double cost;
    private String note = "";
    private Date restockedAt = new Date();

    public RestockHistory() {}

    public RestockHistory(Double quantity, Double cost, String note) {
        this.quantity = quantity;
        this.cost = cost;
        this.note = note != null ? note : "";
        this.restockedAt = new Date();
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Date getRestockedAt() {
        return restockedAt;
    }

    public void setRestockedAt(Date restockedAt) {
        this.restockedAt = restockedAt;
    }
}
