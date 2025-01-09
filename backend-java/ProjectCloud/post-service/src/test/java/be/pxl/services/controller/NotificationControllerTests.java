package be.pxl.services.controller;

import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.controller.response.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.repository.NotificationRepository;
import be.pxl.services.services.INotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class NotificationControllerTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Container
    private static MySQLContainer sqlContainer = new MySQLContainer("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

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
    }

    @Test
    void shouldGetNotifications() throws Exception {
        notificationService.sendNotification(new NotificationDTO(1, "Notification", "testUser"));

        mockMvc.perform(get("/api/notifications")
                        .header("User", "testUser"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldSendNotification() throws Exception {
        NotificationDTO notificationDTO = new NotificationDTO(1,"Notification", "User");

        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationDTO)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldMarkAsRead() throws Exception {
        Notification notification = new Notification();
        notification.setAuthor("testUser");
        notification.setMessage("Notification");
        notificationRepository.save(notification);


        mockMvc.perform(put("/api/notifications")
                        .header("User", "testUser"))
                .andExpect(status().isOk());
    }
}