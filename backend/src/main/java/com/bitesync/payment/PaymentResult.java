package com.bitesync.payment;

public class PaymentResult {
    private boolean successful;
    private String transactionId;
    private String message;
    private Double balanceAfter;

    public PaymentResult() {}

    public PaymentResult(boolean successful, String transactionId, String message) {
        this.successful = successful;
        this.transactionId = transactionId;
        this.message = message;
    }

    public PaymentResult(boolean successful, String transactionId, String message, Double balanceAfter) {
        this.successful = successful;
        this.transactionId = transactionId;
        this.message = message;
        this.balanceAfter = balanceAfter;
    }

    public static PaymentResult success(String transactionId, String message) {
        return new PaymentResult(true, transactionId, message);
    }

    public static PaymentResult success(String transactionId, String message, Double balanceAfter) {
        return new PaymentResult(true, transactionId, message, balanceAfter);
    }

    public static PaymentResult failure(String message) {
        return new PaymentResult(false, null, message);
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Double getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(Double balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
}
