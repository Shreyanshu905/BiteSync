package com.bitesync.payment;

import com.bitesync.interfaces.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: Implements PaymentMethod for payment gateway / cards.
 */
@Component("onlinePayment")
public class OnlinePayment implements PaymentMethod {

    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        String txnId = "PG-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return PaymentResult.success(txnId, "Online Gateway payment captured");
    }

    @Override
    public PaymentResult refundPayment(String studentId, String transactionId, double amount, String orderNumber) {
        return PaymentResult.success("PG-REF-" + System.currentTimeMillis(), "Online Gateway refund processed");
    }

    @Override
    public String getMethodName() {
        return "demo_gateway";
    }
}
