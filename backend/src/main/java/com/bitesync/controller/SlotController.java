package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.dto.SlotDtos;
import com.bitesync.model.slot.PickupSlot;
import com.bitesync.service.SlotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PickupSlot>>> getSlots(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String mealPeriod) {

        List<PickupSlot> slots = slotService.getSlots(date, mealPeriod);
        return ResponseEntity.ok(ApiResponse.success(slots, slots.size()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PickupSlot>> createSlot(@RequestBody SlotDtos.CreateSlotRequest request) {
        PickupSlot created = slotService.createSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Pickup slot created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PickupSlot>> updateSlot(
            @PathVariable String id,
            @RequestBody SlotDtos.UpdateSlotRequest request) {

        PickupSlot updated = slotService.updateSlot(id, request);
        return ResponseEntity.ok(ApiResponse.success("Pickup slot updated", updated));
    }

    @PatchMapping("/{id}/toggle-close")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<ApiResponse<PickupSlot>> toggleCloseSlot(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = body != null ? body.get("reason") : null;
        PickupSlot slot = slotService.toggleCloseSlot(id, reason);
        return ResponseEntity.ok(ApiResponse.success(
                "Slot " + (Boolean.TRUE.equals(slot.getIsClosed()) ? "closed" : "reopened"),
                slot
        ));
    }
}
