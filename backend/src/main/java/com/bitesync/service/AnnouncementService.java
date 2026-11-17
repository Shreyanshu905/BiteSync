package com.bitesync.service;

import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.announcement.Announcement;
import com.bitesync.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByIsActiveOrderByCreatedAtDesc(true);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Announcement createAnnouncement(Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    public Announcement updateAnnouncement(String id, Announcement updateData) {
        Announcement existing = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));

        if (updateData.getTitle() != null) existing.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) existing.setDescription(updateData.getDescription());
        if (updateData.getType() != null) existing.setType(updateData.getType());
        if (updateData.getDiscountPercent() != null) existing.setDiscountPercent(updateData.getDiscountPercent());
        if (updateData.getCouponCode() != null) existing.setCouponCode(updateData.getCouponCode());
        if (updateData.getMaxDiscountAmount() != null) existing.setMaxDiscountAmount(updateData.getMaxDiscountAmount());
        if (updateData.getMinOrderAmount() != null) existing.setMinOrderAmount(updateData.getMinOrderAmount());
        if (updateData.getHostelSpecific() != null) existing.setHostelSpecific(updateData.getHostelSpecific());
        if (updateData.getBadgeText() != null) existing.setBadgeText(updateData.getBadgeText());
        if (updateData.getIsActive() != null) existing.setIsActive(updateData.getIsActive());
        if (updateData.getBannerColor() != null) existing.setBannerColor(updateData.getBannerColor());

        return announcementRepository.save(existing);
    }

    public void deleteAnnouncement(String id) {
        announcementRepository.deleteById(id);
    }
}
