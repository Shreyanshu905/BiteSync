package com.bitesync.dto;

import java.util.List;

public class OrderDtos {

    public static class CartItemDto {
        private String menuItemId;
        private String menuItem; // Support both naming styles
        private String _id;
        private Integer quantity = 1;
        private String specialInstructions;

        public String getResolvedId() {
            if (menuItemId != null && !menuItemId.isEmpty()) return menuItemId;
            if (menuItem != null && !menuItem.isEmpty()) return menuItem;
            return _id;
        }

        public String getMenuItemId() { return menuItemId; }
        public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }
        public String getMenuItem() { return menuItem; }
        public void setMenuItem(String menuItem) { this.menuItem = menuItem; }
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    }

    public static class CreateOrderRequest {
        private List<CartItemDto> items;
        private String pickupSlotId;
        private String paymentMethod = "wallet";
        private String couponCode;
        private String notes;

        public List<CartItemDto> getItems() { return items; }
        public void setItems(List<CartItemDto> items) { this.items = items; }
        public String getPickupSlotId() { return pickupSlotId; }
        public void setPickupSlotId(String pickupSlotId) { this.pickupSlotId = pickupSlotId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class VerifyPickupRequest {
        private String qrData;
        private String pickupToken;

        public String getQrData() { return qrData; }
        public void setQrData(String qrData) { this.qrData = qrData; }
        public String getPickupToken() { return pickupToken; }
        public void setPickupToken(String pickupToken) { this.pickupToken = pickupToken; }
    }

    public static class CancelOrderRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class RateOrderRequest {
        private Integer rating;
        private String feedback;

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }
}
