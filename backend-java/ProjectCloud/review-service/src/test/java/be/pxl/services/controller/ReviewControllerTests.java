package be.pxl.services.controller;

import be.pxl.services.controller.dto.PostReviewDTO;
import be.pxl.services.repository.ReviewRepository;
import be.pxl.services.services.IReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class ReviewControllerTests {
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
    private ReviewRepository reviewRepository;

    @MockBean
    private IReviewService reviewService;

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
    }

    @Test
    void shouldGetAllReviewablePosts() throws Exception {
        when(reviewService.getAllReviewablePosts()).thenReturn(List.of(new PostReviewDTO(1L, "Review", "Title", "Content", "Author", 1L, false)));

        mockMvc.perform(get("/api/reviews")
                        .header("Role", "head_editor"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldNotGetAllReviewablePosts_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/reviews")
                        .header("Role", "editor"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldApproveReview() throws Exception {
        PostReviewDTO postReviewDTO = new PostReviewDTO(1L, "Review", "Title", "Content", "Author", 1L, true);
        doNothing().when(reviewService).reviewPost(anyLong(), any(PostReviewDTO.class));

        mockMvc.perform(put("/api/reviews/1")
                        .header("Role", "head_editor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postReviewDTO)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldNotApproveReview_Unauthorized() throws Exception {
        PostReviewDTO postReviewDTO = new PostReviewDTO(1L, "Review", "Title", "Content", "Author", 1L, true);

        mockMvc.perform(put("/api/reviews/1")
                        .header("Role", "editor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postReviewDTO)))
                .andExpect(status().isUnauthorized());
    }
}
