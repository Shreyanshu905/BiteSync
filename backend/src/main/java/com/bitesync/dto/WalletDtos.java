package com.bitesync.dto;

public class WalletDtos {

    public static class TopUpRequest {
        private Double amount;
        private String paymentMethod = "upi";

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }
}
