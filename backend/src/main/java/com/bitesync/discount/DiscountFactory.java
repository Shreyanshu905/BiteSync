package com.bitesync.discount;

import com.bitesync.interfaces.DiscountStrategy;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Demonstrates OOPS:
 * - RUNTIME POLYMORPHISM & STRATEGY SELECTION: Resolves appropriate DiscountStrategy.
 */
@Component
public class DiscountFactory {

    private final List<DiscountStrategy> strategies;

    public DiscountFactory(List<DiscountStrategy> strategies) {
        this.strategies = strategies;
    }

    public double resolveAndApplyDiscount(double subtotal, String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return 0.0;
        }

        for (DiscountStrategy strategy : strategies) {
            if (strategy.isApplicable(subtotal, couponCode)) {
                return strategy.calculateDiscount(subtotal, couponCode);
            }
        }

        return 0.0;
    }
}
