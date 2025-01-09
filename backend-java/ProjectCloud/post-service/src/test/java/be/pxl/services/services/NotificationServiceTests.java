package be.pxl.services.services;

import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.controller.dto.PostReviewShortMessageDTO;
import be.pxl.services.controller.response.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.repository.NotificationRepository;
import be.pxl.services.repository.PostRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class NotificationServiceTests {

    @MockBean
    private RabbitTemplate rabbitTemplate;


    @Container
    private static MySQLContainer sqlContainer = new MySQLContainer("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;


    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", sqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", sqlContainer::getUsername);
        registry.add("spring.datasource.password", sqlContainer::getPassword);
        registry.add("spring.datasource.driver-class-name",
                () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto",
                () -> "create-drop");
    }


    @BeforeEach
    void setup() {
        notificationRepository.deleteAll();
        doNothing().when(rabbitTemplate).convertAndSend(anyString(), any(PostReviewShortMessageDTO.class));
    }

    @Test
    void shouldGetNotifications() {
        Notification notification = new Notification();
        notification.setAuthor("testUser");
        notification.setMessage("Notification");
        notificationRepository.save(notification);

        List<NotificationResponse> notifications = notificationService.getNotifications("testUser");

        assertEquals(1, notifications.size());
        assertEquals("Notification", notifications.get(0).message());
    }

    @Test
    void shouldSendNotification() {
        NotificationDTO notificationDTO = new NotificationDTO(1L,"Notification", "testUser");

        notificationService.sendNotification(notificationDTO);

        List<Notification> notifications= notificationRepository.findAll();
        assertEquals(1, notifications.size());
        assertEquals("Notification", notifications.get(0).getMessage());
        assertEquals("testUser", notifications.get(0).getAuthor());
    }

    @Test
    void shouldMarkAllAsRead() {
        Notification notification = new Notification();
        notification.setAuthor("testUser");
        notification.setMessage("Notification");
        notificationRepository.save(notification);

        notificationService.markAllAsRead("testUser");

        notificationRepository.deleteAllByAuthor("testUser");

        List<Notification> notifications = notificationRepository.findByAuthor("testUser");
        assertEquals(0, notifications.size());
    }
}
