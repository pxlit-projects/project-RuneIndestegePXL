package be.pxl.services.controller;

import be.pxl.services.controller.dto.request.CommentChangeRequest;
import be.pxl.services.controller.dto.request.CommentCreateRequest;
import be.pxl.services.domain.Comment;
import be.pxl.services.feign.PostClient;
import be.pxl.services.repository.CommentRepository;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class CommentControllerTests {
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
    private CommentRepository commentRepository;

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
    @MockBean
    private PostClient postClient;

    @BeforeEach
    void setup() {
        commentRepository.deleteAll();
        when(postClient.checkIfPostExists(any())).thenReturn(true);
    }

    @Test
    void shouldGetComments() throws Exception {
        mockMvc.perform(get("/api/comments/post/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldCreateComment() throws Exception {
        CommentCreateRequest request = new CommentCreateRequest(1L, "This is a comment");
        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .header("User", "testuser"))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldDeleteComment() throws Exception {
        Comment comment = new Comment(1L, "This is a comment", "testuser");
        commentRepository.save(comment);

        mockMvc.perform(delete("/api/comments/" + comment.getId())
                        .header("User", "testuser"))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldUpdateComment() throws Exception {
        Comment comment = new Comment(1L, "This is a comment", "testuser");
        commentRepository.save(comment);

        CommentChangeRequest request = new CommentChangeRequest(comment.getId(), "Updated comment");
        mockMvc.perform(put("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .header("User", "testuser"))
                .andExpect(status().isNoContent());
    }
}
