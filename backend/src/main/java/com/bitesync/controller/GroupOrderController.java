package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.model.group.GroupOrder;
import com.bitesync.security.UserPrincipal;
import com.bitesync.service.GroupOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/group-orders")
public class GroupOrderController {

    private final GroupOrderService groupOrderService;

    public GroupOrderController(GroupOrderService groupOrderService) {
        this.groupOrderService = groupOrderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupOrder>> createGroup(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody(required = false) Map<String, String> body) {

        String title = body != null ? body.get("title") : "Hostel Group Meal";
        String slotId = body != null ? body.get("pickupSlotId") : null;
        GroupOrder group = groupOrderService.createGroup(currentUser.getId(), title, slotId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Group created", group));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<GroupOrder>> getGroupByCode(@PathVariable String code) {
        GroupOrder group = groupOrderService.getGroupByCode(code);
        return ResponseEntity.ok(ApiResponse.success(group));
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<ApiResponse<GroupOrder>> joinGroup(
            @PathVariable String code,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        GroupOrder group = groupOrderService.joinGroup(code, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Joined group order", group));
    }

    @PostMapping("/{code}/items")
    public ResponseEntity<ApiResponse<GroupOrder>> addItem(
            @PathVariable String code,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> body) {

        String menuItemId = body.get("menuItemId") != null ? body.get("menuItemId").toString() : null;
        int quantity = body.get("quantity") != null ? ((Number) body.get("quantity")).intValue() : 1;

        GroupOrder group = groupOrderService.addItemToGroup(code, currentUser.getId(), currentUser.getUsername(), menuItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Item added to group order", group));
    }
}
