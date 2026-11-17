package com.bitesync.payment;

import com.bitesync.interfaces.PaymentMethod;
import com.bitesync.model.mealplan.MealCredit;
import com.bitesync.repository.MealCreditRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: Implements PaymentMethod by deducting mess pass credits.
 */
@Component("mealCreditPayment")
public class MealCreditPayment implements PaymentMethod {

    private final MealCreditRepository mealCreditRepository;

    public MealCreditPayment(MealCreditRepository mealCreditRepository) {
        this.mealCreditRepository = mealCreditRepository;
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        Optional<MealCredit> creditOpt = mealCreditRepository.findFirstByStudentAndIsActiveAndRemainingCreditsGreaterThan(
                request.getStudentId(), true, 0);

        if (creditOpt.isEmpty()) {
            return PaymentResult.failure("No active meal plan credits found. Please purchase a meal pass or pay via wallet.");
        }

        MealCredit credit = creditOpt.get();
        credit.redeem(request.getOrderNumber(), "meal");
        mealCreditRepository.save(credit);

        String txnId = "CREDIT-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return PaymentResult.success(txnId, "1 Meal Pass Credit redeemed successfully");
    }

    @Override
    public PaymentResult refundPayment(String studentId, String transactionId, double amount, String orderNumber) {
        Optional<MealCredit> creditOpt = mealCreditRepository.findFirstByStudentAndIsActiveAndRemainingCreditsGreaterThan(
                studentId, true, -1);
        if (creditOpt.isPresent()) {
            MealCredit credit = creditOpt.get();
            credit.setRemainingCredits(credit.getRemainingCredits() + 1);
            mealCreditRepository.save(credit);
            return PaymentResult.success("CREDIT-REF-" + System.currentTimeMillis(), "Meal Credit restored successfully");
        }
        return PaymentResult.failure("Could not restore meal credit.");
    }

    @Override
    public String getMethodName() {
        return "meal_credit";
    }
}
