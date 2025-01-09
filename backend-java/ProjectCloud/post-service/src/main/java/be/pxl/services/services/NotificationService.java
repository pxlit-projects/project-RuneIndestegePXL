package be.pxl.services.services;

import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.controller.response.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService implements INotificationService {
    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getNotifications(String user) {
        return notificationRepository.findByAuthor(user).stream().map(
                notification ->
                new NotificationResponse(notification.getMessage())).toList();
    }

    public void sendNotification(NotificationDTO dto) {
        Notification notification = new Notification();
        notification.setAuthor(dto.author());
        notification.setMessage(dto.message());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String user) {
        notificationRepository.deleteAllByAuthor(user);
    }
}
