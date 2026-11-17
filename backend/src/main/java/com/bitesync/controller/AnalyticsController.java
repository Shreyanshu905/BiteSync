package com.bitesync.controller;

import com.bitesync.dto.AnalyticsDtos;
import com.bitesync.dto.ApiResponse;
import com.bitesync.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsDtos.OverviewStatsDto>> getOverview() {
        AnalyticsDtos.OverviewStatsDto stats = analyticsService.getOverviewStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/sales-trends")
    public ResponseEntity<ApiResponse<List<AnalyticsDtos.SalesTrendDto>>> getSalesTrends() {
        List<AnalyticsDtos.SalesTrendDto> trends = analyticsService.getSalesTrends();
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    @GetMapping("/dish-popularity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDishPopularity() {
        List<Map<String, Object>> popularity = analyticsService.getDishPopularity();
        ApiResponse<List<Map<String, Object>>> response = ApiResponse.success(popularity);
        response.setPopularDishes(popularity);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/demand-prediction")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDemandPrediction() {
        Map<String, Object> prediction = analyticsService.getDemandPrediction();
        return ResponseEntity.ok(ApiResponse.success(prediction));
    }

    @GetMapping("/waste-reduction")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWasteAnalytics() {
        Map<String, Object> waste = analyticsService.getWasteAnalytics();
        return ResponseEntity.ok(ApiResponse.success(waste));
    }
}
