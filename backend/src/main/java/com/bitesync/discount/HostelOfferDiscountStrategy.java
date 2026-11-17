package com.bitesync.discount;

import com.bitesync.interfaces.DiscountStrategy;
import org.springframework.stereotype.Component;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: 20% hostel discount on orders >= ₹150 up to ₹60 cap.
 */
@Component
public class HostelOfferDiscountStrategy implements DiscountStrategy {

    @Override
    public boolean isApplicable(double subtotal, String couponCode) {
        if (couponCode == null) return false;
        return "HOSTEL20".equalsIgnoreCase(couponCode.trim()) && subtotal >= 150.0;
    }

    @Override
    public double calculateDiscount(double subtotal, String couponCode) {
        if (!isApplicable(subtotal, couponCode)) return 0.0;
        double rawDiscount = subtotal * 0.20;
        return Math.min(Math.round(rawDiscount), 60.0);
    }

    @Override
    public String getStrategyName() {
        return "20% Hostel Roommate Special (Orders >= ₹150, Max ₹60)";
    }
}
