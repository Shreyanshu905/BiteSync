package com.bitesync.discount;

import com.bitesync.interfaces.DiscountStrategy;
import org.springframework.stereotype.Component;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: 10% discount up to ₹50 cap for welcome/launch coupons.
 */
@Component
public class PercentageDiscountStrategy implements DiscountStrategy {

    @Override
    public boolean isApplicable(double subtotal, String couponCode) {
        if (couponCode == null) return false;
        String code = couponCode.trim().toUpperCase();
        return code.equals("BITESYNC10") || code.equals("WELCOME10");
    }

    @Override
    public double calculateDiscount(double subtotal, String couponCode) {
        if (!isApplicable(subtotal, couponCode)) return 0.0;
        double rawDiscount = subtotal * 0.10;
        return Math.min(Math.round(rawDiscount), 50.0);
    }

    @Override
    public String getStrategyName() {
        return "10% Welcome Discount (Max ₹50)";
    }
}
