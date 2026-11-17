package com.bitesync.model.order;

import com.bitesync.model.user.HostelDetails;
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
 * - COMPOSITION: Order contains embedded OrderItems, SlotDisplay, PaymentDetails, and StatusTimestamps.
 * - AGGREGATION: Associated with Student (User ID) and PickupSlot.
 * - ENCAPSULATION: Lifecycle state transitions and duplicate collection protection.
 */
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNumber; // e.g. "BS-10293"

    @Indexed
    @org.springframework.data.mongodb.core.mapping.Field(targetType = org.springframework.data.mongodb.core.mapping.FieldType.OBJECT_ID)
    private String student; // User ID

    private List<OrderItem> items = new ArrayList<>();

    private Double totalAmount = 0.0;
    private Double discountAmount = 0.0;
    private Double finalAmount = 0.0;

    @Indexed
    private String status = "placed"; // placed, accepted, preparing, ready, collected, cancelled

    @Indexed
    @org.springframework.data.mongodb.core.mapping.Field(targetType = org.springframework.data.mongodb.core.mapping.FieldType.OBJECT_ID)
    private String pickupSlot; // PickupSlot ID

    private SlotDisplay slotDisplay = new SlotDisplay();

    @Indexed(unique = true)
    private String pickupToken; // e.g. "TK-84FD"

    private String qrCodeData; // HMAC-signed JSON payload

    private String paymentMethod = "wallet"; // wallet, upi, demo_gateway, meal_credit
    private String paymentStatus = "completed"; // pending, completed, refunded, failed
    private PaymentDetails paymentDetails = new PaymentDetails();

    private String orderType = "regular"; // regular, group, scheduled
    private String groupOrderId;
    private Date scheduledFor;

    private HostelDetails hostelDetails = new HostelDetails();
    private Date cancellationDeadline;
    private String cancellationReason;

    private Integer estimatedWaitTimeMinutes = 15;
    private Integer rating;
    private String feedback;

    private StatusTimestamps statusTimestamps = new StatusTimestamps();
    private String collectedByStaff; // User ID of kitchen staff who scanned QR
    private Boolean isNoShow = false;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Order() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Domain Business Methods (Encapsulation)
    public void calculateTotals() {
        double subtotal = 0.0;
        if (this.items != null) {
            for (OrderItem item : this.items) {
                if (item.getSubtotal() != null) {
                    subtotal += item.getSubtotal();
                }
            }
        }
        this.totalAmount = subtotal;
        double discount = this.discountAmount != null ? this.discountAmount : 0.0;
        this.finalAmount = Math.max(0.0, subtotal - discount);
    }

    public boolean isCollected() {
        return "collected".equalsIgnoreCase(this.status);
    }

    public boolean isCancelled() {
        return "cancelled".equalsIgnoreCase(this.status);
    }

    public boolean canBeCancelled() {
        if (isCollected() || isCancelled()) {
            return false;
        }
        if (this.cancellationDeadline != null && new Date().after(this.cancellationDeadline)) {
            return false;
        }
        return true;
    }

    public void markAccepted() {
        this.status = "accepted";
        this.statusTimestamps.setAcceptedAt(new Date());
    }

    public void markPreparing() {
        this.status = "preparing";
        this.statusTimestamps.setPreparingAt(new Date());
    }

    public void markReady() {
        this.status = "ready";
        this.statusTimestamps.setReadyAt(new Date());
    }

    public void markCollected(String staffId) {
        if (isCollected()) {
            throw new IllegalStateException("Duplicate collection attempt! Order was already collected.");
        }
        this.status = "collected";
        this.statusTimestamps.setCollectedAt(new Date());
        this.collectedByStaff = staffId;
    }

    public void markCancelled(String reason) {
        this.status = "cancelled";
        this.statusTimestamps.setCancelledAt(new Date());
        this.cancellationReason = reason != null ? reason : "Cancelled";
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

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getStudent() {
        return student;
    }

    public void setStudent(String student) {
        this.student = student;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
        calculateTotals();
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
        calculateTotals();
    }

    public Double getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(Double finalAmount) {
        this.finalAmount = finalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPickupSlot() {
        return pickupSlot;
    }

    public void setPickupSlot(String pickupSlot) {
        this.pickupSlot = pickupSlot;
    }

    public SlotDisplay getSlotDisplay() {
        return slotDisplay;
    }

    public void setSlotDisplay(SlotDisplay slotDisplay) {
        this.slotDisplay = slotDisplay;
    }

    public String getPickupToken() {
        return pickupToken;
    }

    public void setPickupToken(String pickupToken) {
        this.pickupToken = pickupToken;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentDetails getPaymentDetails() {
        return paymentDetails;
    }

    public void setPaymentDetails(PaymentDetails paymentDetails) {
        this.paymentDetails = paymentDetails;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getGroupOrderId() {
        return groupOrderId;
    }

    public void setGroupOrderId(String groupOrderId) {
        this.groupOrderId = groupOrderId;
    }

    public Date getScheduledFor() {
        return scheduledFor;
    }

    public void setScheduledFor(Date scheduledFor) {
        this.scheduledFor = scheduledFor;
    }

    public HostelDetails getHostelDetails() {
        return hostelDetails;
    }

    public void setHostelDetails(HostelDetails hostelDetails) {
        this.hostelDetails = hostelDetails;
    }

    public Date getCancellationDeadline() {
        return cancellationDeadline;
    }

    public void setCancellationDeadline(Date cancellationDeadline) {
        this.cancellationDeadline = cancellationDeadline;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public Integer getEstimatedWaitTimeMinutes() {
        return estimatedWaitTimeMinutes;
    }

    public void setEstimatedWaitTimeMinutes(Integer estimatedWaitTimeMinutes) {
        this.estimatedWaitTimeMinutes = estimatedWaitTimeMinutes;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public StatusTimestamps getStatusTimestamps() {
        return statusTimestamps;
    }

    public void setStatusTimestamps(StatusTimestamps statusTimestamps) {
        this.statusTimestamps = statusTimestamps;
    }

    public String getCollectedByStaff() {
        return collectedByStaff;
    }

    public void setCollectedByStaff(String collectedByStaff) {
        this.collectedByStaff = collectedByStaff;
    }

    public Boolean getIsNoShow() {
        return isNoShow;
    }

    public void setIsNoShow(Boolean noShow) {
        isNoShow = noShow;
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
