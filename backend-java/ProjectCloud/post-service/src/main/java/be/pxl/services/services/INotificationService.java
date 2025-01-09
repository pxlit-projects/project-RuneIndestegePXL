package be.pxl.services.services;

import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.controller.response.NotificationResponse;

import java.util.List;

public interface INotificationService {
    List<NotificationResponse> getNotifications(String user);

    void sendNotification(NotificationDTO dto);

    void markAllAsRead(String user);
}
