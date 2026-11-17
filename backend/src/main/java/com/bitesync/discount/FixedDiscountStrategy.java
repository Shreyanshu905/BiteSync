package com.bitesync.discount;

import com.bitesync.interfaces.DiscountStrategy;
import org.springframework.stereotype.Component;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: ₹30 flat discount for orders >= ₹100.
 */
@Component
public class FixedDiscountStrategy implements DiscountStrategy {

    @Override
    public boolean isApplicable(double subtotal, String couponCode) {
        if (couponCode == null) return false;
        return "FLAT30".equalsIgnoreCase(couponCode.trim()) && subtotal >= 100.0;
    }

    @Override
    public double calculateDiscount(double subtotal, String couponCode) {
        if (!isApplicable(subtotal, couponCode)) return 0.0;
        return 30.0;
    }

    @Override
    public String getStrategyName() {
        return "Flat ₹30 Off Special";
    }
}
