package com.bitesync.service;

import com.bitesync.exception.BiteSyncException;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.mealplan.MealCredit;
import com.bitesync.model.mealplan.MealPlan;
import com.bitesync.model.mealplan.MealSkip;
import com.bitesync.model.mealplan.MealTransfer;
import com.bitesync.model.user.Student;
import com.bitesync.model.user.User;
import com.bitesync.repository.*;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final MealCreditRepository mealCreditRepository;
    private final MealSkipRepository mealSkipRepository;
    private final MealTransferRepository mealTransferRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public MealPlanService(MealPlanRepository mealPlanRepository,
                           MealCreditRepository mealCreditRepository,
                           MealSkipRepository mealSkipRepository,
                           MealTransferRepository mealTransferRepository,
                           UserRepository userRepository,
                           WalletService walletService) {
        this.mealPlanRepository = mealPlanRepository;
        this.mealCreditRepository = mealCreditRepository;
        this.mealSkipRepository = mealSkipRepository;
        this.mealTransferRepository = mealTransferRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    public List<MealPlan> getActivePlans() {
        return mealPlanRepository.findByIsActive(true);
    }

    public MealCredit subscribeToPlan(String planId, String studentId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan not found: " + planId));

        // Deduct from wallet
        walletService.debit(studentId, plan.getPrice(), "Meal Plan Subscription: " + plan.getName(), "PLAN-" + System.currentTimeMillis());

        long durationMs = (long) (plan.getDurationDays() != null ? plan.getDurationDays() : 7) * 24 * 60 * 60 * 1000L;
        Date validUntil = new Date(System.currentTimeMillis() + durationMs);

        MealCredit credit = new MealCredit();
        credit.setStudent(studentId);
        credit.setMealPlan(plan.getId());
        credit.setTotalCredits(plan.getMealCreditsCount());
        credit.setRemainingCredits(plan.getMealCreditsCount());
        credit.setValidUntil(validUntil);
        credit.setIsActive(true);

        return mealCreditRepository.save(credit);
    }

    public List<MealCredit> getStudentCredits(String studentId) {
        return mealCreditRepository.findByStudentAndIsActive(studentId, true);
    }

    public MealSkip recordMealSkip(String studentId, String date, String mealPeriod, String reason) {
        MealSkip skip = mealSkipRepository.findByStudentAndDateAndMealPeriod(studentId, date, mealPeriod)
                .orElse(new MealSkip());

        skip.setStudent(studentId);
        skip.setDate(date);
        skip.setMealPeriod(mealPeriod);
        skip.setReason(reason != null ? reason : "Not at hostel");
        skip.setStatus("active");

        return mealSkipRepository.save(skip);
    }

    public List<MealSkip> getSkippedMeals(String studentId) {
        return mealSkipRepository.findByStudentOrderByCreatedAtDesc(studentId);
    }

    public MealTransfer transferCredits(String senderId, String recipientStudentId, int creditsCount, String message) {
        if (creditsCount <= 0) {
            throw new BiteSyncException("Number of credits must be at least 1.");
        }

        // Find recipient by studentId
        User recipient = userRepository.findAll().stream()
                .filter(u -> u instanceof Student s && recipientStudentId.equalsIgnoreCase(s.getStudentId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Recipient student not found with ID: " + recipientStudentId));

        MealCredit senderCredit = mealCreditRepository.findFirstByStudentAndIsActiveAndRemainingCreditsGreaterThan(
                senderId, true, creditsCount - 1)
                .orElseThrow(() -> new BiteSyncException("Insufficient active meal credits for transfer."));

        senderCredit.setRemainingCredits(senderCredit.getRemainingCredits() - creditsCount);
        mealCreditRepository.save(senderCredit);

        // Add to recipient
        MealCredit recCredit = mealCreditRepository.findFirstByStudentAndIsActiveAndRemainingCreditsGreaterThan(
                recipient.getId(), true, -1).orElse(null);

        if (recCredit != null) {
            recCredit.setRemainingCredits(recCredit.getRemainingCredits() + creditsCount);
            mealCreditRepository.save(recCredit);
        } else {
            MealCredit newCredit = new MealCredit();
            newCredit.setStudent(recipient.getId());
            newCredit.setMealPlan(senderCredit.getMealPlan());
            newCredit.setTotalCredits(creditsCount);
            newCredit.setRemainingCredits(creditsCount);
            newCredit.setValidUntil(senderCredit.getValidUntil());
            newCredit.setIsActive(true);
            mealCreditRepository.save(newCredit);
        }

        MealTransfer transfer = new MealTransfer();
        transfer.setSender(senderId);
        transfer.setRecipient(recipient.getId());
        transfer.setRecipientStudentId(recipientStudentId.toUpperCase());
        transfer.setCreditsCount(creditsCount);
        transfer.setMealCreditId(senderCredit.getId());
        transfer.setStatus("completed");
        transfer.setMessage(message != null ? message : "Meal pass shared with hostel friend");

        return mealTransferRepository.save(transfer);
    }
}
