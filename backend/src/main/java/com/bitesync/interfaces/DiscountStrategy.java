package com.bitesync.interfaces;

/**
 * Demonstrates OOPS:
 * - ABSTRACTION & STRATEGY PATTERN: Encapsulates coupon discount algorithms.
 * - POLYMORPHISM: Different discount strategies execute dynamically.
 */
public interface DiscountStrategy {

    boolean isApplicable(double subtotal, String couponCode);

    double calculateDiscount(double subtotal, String couponCode);

    String getStrategyName();
}
