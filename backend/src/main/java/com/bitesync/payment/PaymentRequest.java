package com.bitesync.payment;

public class PaymentRequest {
    private String studentId;
    private Double amount;
    private String orderNumber;
    private String description;
    private String paymentMethod;
    private String upiReference;

    public PaymentRequest() {}

    public PaymentRequest(String studentId, Double amount, String orderNumber, String description, String paymentMethod) {
        this.studentId = studentId;
        this.amount = amount;
        this.orderNumber = orderNumber;
        this.description = description;
        this.paymentMethod = paymentMethod;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getUpiReference() {
        return upiReference;
    }

    public void setUpiReference(String upiReference) {
        this.upiReference = upiReference;
    }
}
