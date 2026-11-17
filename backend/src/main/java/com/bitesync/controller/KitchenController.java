package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.model.order.Order;
import com.bitesync.service.KitchenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen")
@PreAuthorize("hasAnyRole('KITCHEN', 'ADMIN')")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<Order>>> getKitchenQueue() {
        List<Order> queue = kitchenService.getKitchenQueue();
        return ResponseEntity.ok(ApiResponse.success(queue, queue.size()));
    }

    @GetMapping("/ready")
    public ResponseEntity<ApiResponse<List<Order>>> getReadyOrders() {
        List<Order> ready = kitchenService.getReadyOrders();
        return ResponseEntity.ok(ApiResponse.success(ready, ready.size()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPreparationSummary() {
        Map<String, Object> summary = kitchenService.getPreparationSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/report-delay")
    public ResponseEntity<ApiResponse<Void>> reportDelay(@RequestBody Map<String, Object> body) {
        int minutes = body.get("delayMinutes") != null ? ((Number) body.get("delayMinutes")).intValue() : 15;
        String reason = body.get("reason") != null ? body.get("reason").toString() : "Kitchen rush";
        kitchenService.reportDelay(minutes, reason);
        return ResponseEntity.ok(ApiResponse.message("Delay reported to active students"));
    }
}
