package com.bitesync.service;

import com.bitesync.interfaces.NotificationService;
import com.bitesync.model.notification.Notification;
import com.bitesync.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void notifyStudent(String studentId, String title, String message, String type, Map<String, Object> data) {
        Notification notification = new Notification(studentId, title, message, type);
        if (data != null) {
            notification.setData(data);
        }
        notificationRepository.save(notification);
    }

    @Override
    public void notifyRole(String role, String title, String message, String type, Map<String, Object> data) {
        Notification notification = new Notification(null, title, message, type);
        notification.setRoleTarget(role != null ? role.toLowerCase() : "all");
        if (data != null) {
            notification.setData(data);
        }
        notificationRepository.save(notification);
    }

    public List<Notification> getStudentNotifications(String studentId) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(studentId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String studentId) {
        List<Notification> list = notificationRepository.findByRecipientOrderByCreatedAtDesc(studentId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
