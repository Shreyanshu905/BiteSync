package com.bitesync.interfaces;

import com.bitesync.payment.PaymentRequest;
import com.bitesync.payment.PaymentResult;

/**
 * Demonstrates OOPS:
 * - ABSTRACTION: Decouples order orchestration from heterogeneous payment providers.
 * - POLYMORPHISM CONTRACT: Multiple implementations process payments differently.
 */
public interface PaymentMethod {

    PaymentResult processPayment(PaymentRequest request);

    PaymentResult refundPayment(String studentId, String transactionId, double amount, String orderNumber);

    String getMethodName();
}
