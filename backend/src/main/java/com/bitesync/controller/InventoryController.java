package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.dto.InventoryDtos;
import com.bitesync.model.inventory.InventoryItem;
import com.bitesync.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getAllInventory() {
        List<InventoryItem> items = inventoryService.getAllInventory();
        return ResponseEntity.ok(ApiResponse.success(items, items.size()));
    }

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getLowStockAlerts() {
        List<InventoryItem> alerts = inventoryService.getLowStockAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts, alerts.size()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryItem>> addInventoryItem(@RequestBody InventoryDtos.CreateInventoryRequest request) {
        InventoryItem item = inventoryService.addInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Ingredient added", item));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryItem>> updateInventoryItem(
            @PathVariable String id,
            @RequestBody InventoryDtos.CreateInventoryRequest request) {

        InventoryItem updated = inventoryService.updateInventoryItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Ingredient updated", updated));
    }

    @PostMapping("/{id}/restock")
    public ResponseEntity<ApiResponse<InventoryItem>> restockItem(
            @PathVariable String id,
            @RequestBody InventoryDtos.RestockRequest request) {

        InventoryItem item = inventoryService.restockItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Restock recorded successfully", item));
    }
}
