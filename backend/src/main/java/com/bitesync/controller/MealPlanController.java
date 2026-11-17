package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.model.mealplan.MealCredit;
import com.bitesync.model.mealplan.MealPlan;
import com.bitesync.model.mealplan.MealSkip;
import com.bitesync.model.mealplan.MealTransfer;
import com.bitesync.security.UserPrincipal;
import com.bitesync.service.MealPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meal-plans")
public class MealPlanController {

    private final MealPlanService mealPlanService;

    public MealPlanController(MealPlanService mealPlanService) {
        this.mealPlanService = mealPlanService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MealPlan>>> getMealPlans() {
        List<MealPlan> plans = mealPlanService.getActivePlans();
        return ResponseEntity.ok(ApiResponse.success(plans, plans.size()));
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<ApiResponse<MealCredit>> subscribe(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        MealCredit credit = mealPlanService.subscribeToPlan(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Subscribed to meal plan successfully", credit));
    }

    @GetMapping("/my-credits")
    public ResponseEntity<ApiResponse<List<MealCredit>>> getMyCredits(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<MealCredit> credits = mealPlanService.getStudentCredits(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(credits, credits.size()));
    }

    @PostMapping("/skip-meal")
    public ResponseEntity<ApiResponse<MealSkip>> skipMeal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> body) {

        String date = body.get("date");
        String mealPeriod = body.get("mealPeriod");
        String reason = body.get("reason");

        MealSkip skip = mealPlanService.recordMealSkip(currentUser.getId(), date, mealPeriod, reason);
        return ResponseEntity.ok(ApiResponse.success("Meal skip recorded to reduce kitchen wastage", skip));
    }

    @GetMapping("/skipped-meals")
    public ResponseEntity<ApiResponse<List<MealSkip>>> getSkippedMeals(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<MealSkip> list = mealPlanService.getSkippedMeals(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @PostMapping("/transfer-credits")
    public ResponseEntity<ApiResponse<MealTransfer>> transferCredits(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> body) {

        String recipientStudentId = body.get("recipientStudentId") != null ? body.get("recipientStudentId").toString() : null;
        int count = body.get("creditsCount") != null ? ((Number) body.get("creditsCount")).intValue() : 1;
        String message = body.get("message") != null ? body.get("message").toString() : "";

        MealTransfer transfer = mealPlanService.transferCredits(currentUser.getId(), recipientStudentId, count, message);
        return ResponseEntity.ok(ApiResponse.success("Credits transferred successfully", transfer));
    }
}
