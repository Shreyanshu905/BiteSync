package com.bitesync.payment;

import com.bitesync.interfaces.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Demonstrates OOPS:
 * - RUNTIME POLYMORPHISM & FACTORY PATTERN: Dispatches to concrete PaymentMethod at runtime.
 */
@Component
public class PaymentFactory {

    private final Map<String, PaymentMethod> paymentMethods = new HashMap<>();

    public PaymentFactory(List<PaymentMethod> methods) {
        for (PaymentMethod method : methods) {
            paymentMethods.put(method.getMethodName().toLowerCase(), method);
        }
    }

    public PaymentMethod getPaymentMethod(String methodName) {
        if (methodName == null) {
            return paymentMethods.get("wallet");
        }
        PaymentMethod method = paymentMethods.get(methodName.toLowerCase());
        if (method == null) {
            // Default fallback
            return paymentMethods.getOrDefault("wallet", paymentMethods.values().iterator().next());
        }
        return method;
    }
}
