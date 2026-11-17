package com.bitesync.payment;

import com.bitesync.interfaces.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: Implements PaymentMethod for UPI transactions.
 */
@Component("upiPayment")
public class UpiPayment implements PaymentMethod {

    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        String txnId = "UPI-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return PaymentResult.success(txnId, "UPI payment verified via Virtual Payment Address");
    }

    @Override
    public PaymentResult refundPayment(String studentId, String transactionId, double amount, String orderNumber) {
        return PaymentResult.success("UPI-REF-" + System.currentTimeMillis(), "UPI refund initiated to source bank account");
    }

    @Override
    public String getMethodName() {
        return "upi";
    }
}
