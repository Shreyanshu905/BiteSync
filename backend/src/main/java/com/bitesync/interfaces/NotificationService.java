package com.bitesync.interfaces;

import java.util.Map;

public interface NotificationService {

    void notifyStudent(String studentId, String title, String message, String type, Map<String, Object> data);

    void notifyRole(String role, String title, String message, String type, Map<String, Object> data);
}
