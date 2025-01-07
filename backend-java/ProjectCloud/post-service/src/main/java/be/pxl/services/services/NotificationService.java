package be.pxl.services.services;

import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.domain.Notification;
import be.pxl.services.exception.NotificationNotFoundException;
import be.pxl.services.exception.UserNotAuthorizedException;
import be.pxl.services.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDTO> getNotifications(String user) {
        return notificationRepository.findByAuthor(user).stream().map(
                notification ->
                new NotificationDTO(
                        notification.getId(),
                        notification.getMessage(),
                        notification.getAuthor(),
                        notification.getPostId()
                )
        ).toList();
    }

    public void sendNotification(NotificationDTO dto) {
        Notification notification = new Notification();
        notification.setAuthor(dto.author());
        notification.setMessage(dto.message());
        notification.setPostId(dto.postId());
        notificationRepository.save(notification);
    }

    public void markAsRead(Long id, String user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
        if (!notification.getAuthor().equals(user)) {
            throw new UserNotAuthorizedException("User is not the author of the notification");
        }
        notificationRepository.deleteById(id);
    }
}
