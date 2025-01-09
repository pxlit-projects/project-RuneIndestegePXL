package be.pxl.services.services;

import be.pxl.services.config.NotificationClient;
import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.controller.dto.PostReviewDTO;
import be.pxl.services.controller.dto.PostReviewShortMessageDTO;
import be.pxl.services.domain.PostReview;
import be.pxl.services.exception.PostReviewNotFoundException;
import be.pxl.services.repository.ReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class ReviewServiceTests {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private NotificationClient notificationClient;

    @Container
    private static MySQLContainer sqlContainer = new MySQLContainer("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewService reviewService;


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
        reviewRepository.deleteAll();
        doNothing().when(notificationClient).sendNotification(any(NotificationDTO.class));
        doNothing().when(rabbitTemplate).convertAndSend(anyString(), any(PostReviewShortMessageDTO.class));
    }



    @Test
    void testReviewablePosts() {
        // Given
        PostReviewDTO postReviewDTO = new PostReviewDTO(
                1L, "Review", "Title", "Content", "Author", 1L, false);

        // Simulate receiving message from queue
        reviewService.reviewablePosts(postReviewDTO);

        // Then
        List<PostReview> savedReviews = reviewRepository.findAll();
        assertEquals(1, savedReviews.size());

        PostReview savedReview = savedReviews.get(0);
        assertEquals(postReviewDTO.title(), savedReview.getTitle());
        assertEquals(postReviewDTO.content(), savedReview.getContent());
        assertEquals(postReviewDTO.author(), savedReview.getAuthor());
        assertEquals(postReviewDTO.postId(), savedReview.getPostId());
    }

    @Test
    void testGetAllReviewablePosts() {
        // Given
        PostReview postReview = new PostReview();
        postReview.setTitle("Title");
        postReview.setContent("Content");
        postReview.setAuthor("Author");
        postReview.setPostId(1L);
        postReview.setApproved(false);
        reviewRepository.save(postReview);

        // When
        List<PostReviewDTO> result = reviewService.getAllReviewablePosts();

        // Then
        assertEquals(1, result.size());
        PostReviewDTO dto = result.get(0);
        assertEquals(postReview.getTitle(), dto.title());
        assertEquals(postReview.getContent(), dto.content());
        assertEquals(postReview.getAuthor(), dto.author());
        assertEquals(postReview.getPostId(), dto.postId());
        assertFalse(dto.approved());
    }





    @Test
    void testReviewPost_NotFound() {
        // Given
        PostReviewDTO reviewDTO = new PostReviewDTO(
                999L, "Review", "Title", "Content", "Author", 1L, true);

        // When & Then
        when(rabbitTemplate.convertSendAndReceive(reviewDTO)).thenReturn(null);
        assertThrows(PostReviewNotFoundException.class,
                () -> reviewService.reviewPost(999L, reviewDTO));
        verify(rabbitTemplate, never()).convertAndSend(any());
        verify(notificationClient, never()).sendNotification(any());
    }

    @Test
    void testReviewPost_Approve() {
        // Given
        PostReview postReview = new PostReview();
        postReview.setTitle("Title");
        postReview.setContent("Content");
        postReview.setAuthor("Author");
        postReview.setPostId(1L);
        postReview.setApproved(false);
        postReview = reviewRepository.save(postReview);

        PostReviewDTO reviewDTO = new PostReviewDTO(
                postReview.getId(), null, "Title", "Content", "Author", 1L, true);

        // When
        doNothing().when(notificationClient).sendNotification(any());

        reviewService.reviewPost(postReview.getId(), reviewDTO);

        // Then
        assertTrue(reviewRepository.findById(postReview.getId()).isEmpty());
        verify(notificationClient).sendNotification(argThat(notification ->
                notification.message().contains("approved") &&
                        notification.author().equals("Author")
        ));
    }

    @Test
    void testReviewPost_Reject() {
        // Given
        PostReview postReview = new PostReview();
        postReview.setTitle("Title");
        postReview.setContent("Content");
        postReview.setAuthor("Author");
        postReview.setPostId(1L);
        postReview.setApproved(false);
        postReview = reviewRepository.save(postReview);

        PostReviewDTO reviewDTO = new PostReviewDTO(
                postReview.getId(), "Rejected for test", "Title", "Content", "Author", 1L, false);

        ArgumentCaptor<PostReviewShortMessageDTO> queueMessageCaptor =
                ArgumentCaptor.forClass(PostReviewShortMessageDTO.class);

        // When
        reviewService.reviewPost(postReview.getId(), reviewDTO);
        doNothing().when(notificationClient).sendNotification(any());

        // Then
        verify(rabbitTemplate).convertAndSend(
                eq("PostQueue"),
                queueMessageCaptor.capture()
        );

        PostReviewShortMessageDTO queueMessage = queueMessageCaptor.getValue();
        assertNotNull(queueMessage);
        assertEquals(postReview.getPostId(), queueMessage.postId());
        assertFalse(queueMessage.approved());
        assertEquals("Rejected for test", queueMessage.review());

        // Verify rejection notification
        ArgumentCaptor<NotificationDTO> notificationCaptor =
                ArgumentCaptor.forClass(NotificationDTO.class);
        verify(notificationClient).sendNotification(notificationCaptor.capture());

        NotificationDTO notification = notificationCaptor.getValue();
        assertEquals(postReview.getAuthor(), notification.author());
        assertTrue(notification.message().contains("rejected"));

        // Verify review was deleted
        assertTrue(reviewRepository.findById(postReview.getId()).isEmpty());
    }
    @Test
    void testReviewPost() {
        // Given
        PostReview postReview = new PostReview();
        postReview.setTitle("Title");
        postReview.setContent("Content");
        postReview.setAuthor("Author");
        postReview.setPostId(1L);
        postReview.setApproved(false);

        PostReview savedReview = reviewRepository.save(postReview);

        PostReviewDTO postReviewDTO = new PostReviewDTO(
                savedReview.getId(),
                "Review",
                "Title",
                "Content",
                "Author",
                1L,
                true
        );

        // When
        reviewService.reviewPost(savedReview.getId(), postReviewDTO);

        // Then
        // Verify
        assertTrue(reviewRepository.findById(savedReview.getId()).isEmpty());

        // Verify
        verify(rabbitTemplate).convertAndSend(
                eq("PostQueue"),
                (Object) argThat(msg -> msg instanceof PostReviewShortMessageDTO
                        && ((PostReviewShortMessageDTO) msg).postId() == 1L
                        && ((PostReviewShortMessageDTO) msg).approved())
        );

        verify(notificationClient).sendNotification(
                argThat(notification ->
                        notification.author().equals("Author") &&
                                notification.message().contains("approved")
                )
        );
    }
}
