package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.model.announcement.Announcement;
import com.bitesync.service.AnnouncementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncements() {
        List<Announcement> list = announcementService.getActiveAnnouncements();
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@RequestBody Announcement announcement) {
        Announcement created = announcementService.createAnnouncement(announcement);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Announcement created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Announcement>> updateAnnouncement(
            @PathVariable String id,
            @RequestBody Announcement announcement) {

        Announcement updated = announcementService.updateAnnouncement(id, announcement);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable String id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.message("Announcement deleted"));
    }
}
