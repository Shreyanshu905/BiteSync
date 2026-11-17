package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.dto.MenuDtos;
import com.bitesync.model.menu.MenuItem;
import com.bitesync.service.MenuService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItem>>> getMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isVeg,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean availableOnly) {

        List<MenuItem> items = menuService.getAllMenuItems(category, isVeg, search, availableOnly);
        return ResponseEntity.ok(ApiResponse.success(items, items.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItem>> getMenuItemById(@PathVariable String id) {
        MenuItem item = menuService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItem>> createMenuItem(@RequestBody MenuDtos.CreateMenuItemRequest request) {
        MenuItem created = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Menu item created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItem>> updateMenuItem(@PathVariable String id, @RequestBody MenuItem updateData) {
        MenuItem updated = menuService.updateMenuItem(id, updateData);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated", updated));
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<ApiResponse<MenuItem>> toggleAvailability(@PathVariable String id) {
        MenuItem item = menuService.toggleAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Dish is now " + (Boolean.TRUE.equals(item.getIsAvailable()) ? "Available" : "Unavailable"),
                item
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.message("Menu item deleted"));
    }
}
