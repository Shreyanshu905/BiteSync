package com.bitesync.repository;

import com.bitesync.model.announcement.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {

    List<Announcement> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);

    Optional<Announcement> findByCouponCode(String couponCode);
}
