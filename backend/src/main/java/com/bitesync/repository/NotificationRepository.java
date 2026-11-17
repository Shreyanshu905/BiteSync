package com.bitesync.repository;

import com.bitesync.model.notification.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipientId);

    List<Notification> findByRoleTargetOrderByCreatedAtDesc(String roleTarget);
}
