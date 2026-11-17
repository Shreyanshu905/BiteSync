package com.bitesync.model.order;

import java.util.Date;

public class PaymentDetails {
    private String transactionId;
    private String upiReference;
    private Date paidAt;
    private Date refundedAt;

    public PaymentDetails() {}

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getUpiReference() {
        return upiReference;
    }

    public void setUpiReference(String upiReference) {
        this.upiReference = upiReference;
    }

    public Date getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Date paidAt) {
        this.paidAt = paidAt;
    }

    public Date getRefundedAt() {
        return refundedAt;
    }

    public void setRefundedAt(Date refundedAt) {
        this.refundedAt = refundedAt;
    }
}
