package be.pxl.services.controller;

import be.pxl.services.controller.dto.PostDTO;
import be.pxl.services.controller.request.PostUpdateRequest;
import be.pxl.services.controller.response.PostReviewedResponse;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.repository.NotificationRepository;
import be.pxl.services.repository.PostRepository;
import be.pxl.services.services.INotificationService;
import be.pxl.services.services.IPostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static reactor.core.publisher.Mono.when;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class PostControllerTests {

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
    private IPostService postService;

    @Autowired
    private PostRepository postRepository;

    @MockBean
    private RabbitTemplate rabbitTemplate;

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
        postRepository.deleteAll();
        doNothing().when(rabbitTemplate).convertAndSend(anyString(), Optional.ofNullable(any()));
    }



    @Test
    void shouldGetPublishedPostById() throws Exception {
        //PostDTO postDTO = new PostDTO(1L, "Title", "Content", "Author", null);
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);

        mockMvc.perform(get("/api/posts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Title"))
                .andExpect(jsonPath("$.content").value("Content"))
                .andExpect(jsonPath("$.author").value("testUser"));
    }


    @Test
    void shouldPublishPost() throws Exception {
        Post post = new Post();
        post.setId(12L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.ACCEPTED);
        postRepository.save(post);

        mockMvc.perform(put("/api/posts/1/publish")
                        .header("User", "testUser")
                        .header("Role", "editor"))
                .andExpect(status().isOk());

        Post post2 = postRepository.findById(12L).orElseThrow();
        assertEquals(post2.getStatus(), PostStatus.PUBLISHED);
    }

    @Test
    void shouldSubmitPost() throws Exception {
        PostDTO postDTO = new PostDTO(11L, "Title", "Content", "testUser", null);

        Post post = new Post();
        post.setId(11L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.DRAFT);
        postRepository.save(post);

        mockMvc.perform(put("/api/posts/submit")
                        .header("User", "testUser")
                        .header("Role", "editor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postDTO)))
                .andExpect(status().isOk());

        Post post2 = postRepository.findById(11L).orElseThrow();
        assertEquals(post2.getTitle(), "Title");
        assertEquals(post2.getContent(), "Content");
        assertEquals(post2.getAuthor(), "testUser");
        assertEquals(post2.getStatus(), PostStatus.SUBMITTED);
    }

    @Test
    void shouldCorrectPost() throws Exception {
        Post post = new Post();
        post.setId(10L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        postRepository.save(post);

        PostUpdateRequest updateRequest = new PostUpdateRequest();
        updateRequest.setTitle("Updated Title");
        updateRequest.setContent("Updated Content");

        mockMvc.perform(put("/api/posts/10")
                        .header("User", "testUser")
                        .header("Role", "editor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        Post updatedPost = postRepository.findById(10L).orElseThrow();
        assertEquals(updatedPost.getTitle(), "Updated Title");
        assertEquals(updatedPost.getContent(), "Updated Content");
    }


    @Test
    void shouldCreatePostAsDraft() throws Exception {
        PostDTO postDTO = new PostDTO(null, "Title", "Content", "testUser", null);
        mockMvc.perform(post("/api/posts")
                        .header("User", "testUser")
                        .header("Role", "editor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postDTO)))
                .andExpect(status().isCreated());

        Post post = postRepository.findById(2L).orElseThrow();
        assertEquals(post.getTitle(), "Title");
        assertEquals(post.getContent(), "Content");
        assertEquals(post.getAuthor(), "testUser");
        assertEquals(post.getStatus(), PostStatus.DRAFT);
    }

    @Test
    void shouldCheckIfPostExists() throws Exception {
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(null);

        postRepository.save(post);

        mockMvc.perform(get("/api/posts/1/exists"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetDraftPosts() throws Exception {
        Post post = new Post();
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.DRAFT);
        Long id = postRepository.save(post).getId();

        mockMvc.perform(get("/api/posts/draft/all")
                        .header("User", "testUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].title").value("Title"))
                .andExpect(jsonPath("$[0].content").value("Content"))
                .andExpect(jsonPath("$[0].author").value("testUser"));
    }

    @Test
    void shouldGetPublishedPosts() throws Exception {
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);

        mockMvc.perform(get("/api/posts/published")
                        .header("User", "testUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Title"))
                .andExpect(jsonPath("$[0].content").value("Content"))
                .andExpect(jsonPath("$[0].author").value("testUser"));
    }

    @Test
    void shouldGetRejectedPosts() throws Exception {
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.REJECTED);
        post.setReview("Review");
        Long id = postRepository.save(post).getId();

        mockMvc.perform(get("/api/posts/rejected")
                        .header("User", "testUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].title").value("Title"))
                .andExpect(jsonPath("$[0].content").value("Content"))
                .andExpect(jsonPath("$[0].author").value("testUser"));
    }

    @Test
    void shouldGetApprovedPosts() throws Exception {
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("testUser");
        post.setStatus(PostStatus.ACCEPTED);
        post.setReview("Review");
        postRepository.save(post);

        mockMvc.perform(get("/api/posts/approved")
                        .header("User", "testUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Title"))
                .andExpect(jsonPath("$[0].content").value("Content"))
                .andExpect(jsonPath("$[0].author").value("testUser"));
    }
}
