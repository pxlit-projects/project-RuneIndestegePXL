package be.pxl.services.services;

import be.pxl.services.controller.dto.PostDTO;
import be.pxl.services.controller.dto.PostReviewShortMessageDTO;
import be.pxl.services.controller.request.PostUpdateRequest;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.exception.PostNotFoundException;
import be.pxl.services.exception.UserNotAuthorizedException;
import be.pxl.services.exception.UserNotFoundException;
import be.pxl.services.repository.PostRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.joda.time.DateTime;
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

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
public class PostServiceTests {

    @Container
    private static MySQLContainer sqlContainer = new MySQLContainer("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private PostService postService;

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
    void shouldAcceptReviewedPost() {
        // Arrange
        Post post = new Post();
        post.setTitle("Test Title");
        post.setContent("Test Content");
        post.setStatus(PostStatus.DRAFT);
        Long postId =postRepository.saveAndFlush(post).getId();

        PostReviewShortMessageDTO reviewPostDTO = new PostReviewShortMessageDTO(null,postId, true);

        // Act
        postService.reviewedPosts(reviewPostDTO);

        // Assert
        Post reviewedPost = postRepository.findById(postId).orElseThrow();
        assertEquals(PostStatus.ACCEPTED, reviewedPost.getStatus());
    }

    @Test
    void shouldRejectReviewedPost() {
        // Arrange
        Post post = new Post();
        post.setTitle("Test Title 2");
        post.setContent("Test Content 2");
        post.setStatus(PostStatus.DRAFT);
        Long postId = postRepository.saveAndFlush(post).getId();

        PostReviewShortMessageDTO reviewPostDTO = new PostReviewShortMessageDTO("Needs revision.", postId, false );

        // Act
        postService.reviewedPosts(reviewPostDTO);

        // Assert
        Post reviewedPost = postRepository.findById(postId).orElseThrow();
        assertEquals(PostStatus.REJECTED, reviewedPost.getStatus());
        assertEquals("Needs revision.", reviewedPost.getReview());
    }

    @Test
    void shouldThrowWhenPostNotFoundInReviewedPosts() {
        // Arrange
        PostReviewShortMessageDTO reviewPostDTO = new PostReviewShortMessageDTO("review",999L, true);

        // Act & Assert
        assertThrows(NoSuchElementException.class, () -> postService.reviewedPosts(reviewPostDTO));
    }

    @Test
    void shouldThrowWhenUserIsNullInCreatePostAsDraft() {
        // Arrange
        PostDTO postDTO = new PostDTO(null, "Draft Title", "Draft Content", null, null);

        // Act & Assert
        UserNotFoundException exception = assertThrows(UserNotFoundException.class,
                () -> postService.createPostAsDraft(postDTO, null)
        );
        assertEquals("User is required", exception.getMessage());
    }



    @Test
    void shouldConvertPostDTOWithAllFields() {
        // Arrange
        PostDTO postDTO = new PostDTO(1L, "Test Title", "Test Content", "Author", LocalDateTime.now());

        // Act
        Post post = postService.convertPostDTOToPost(postDTO);

        // Assert
        assertEquals(1L, post.getId());
        assertEquals("Test Title", post.getTitle());
        assertEquals("Test Content", post.getContent());
        assertEquals("Author", post.getAuthor());
        assertNotNull(post.getCreatedAt());
    }

    @Test
    void shouldConvertPostDTOWithSomeNullFields() {
        // Arrange
        PostDTO postDTO = new PostDTO(null, "Test Title", null, "Author", null);

        // Act
        Post post = postService.convertPostDTOToPost(postDTO);

        // Assert
        assertNull(post.getId());
        assertEquals("Test Title", post.getTitle());
        assertNull(post.getContent());
        assertEquals("Author", post.getAuthor());
        assertNull(post.getCreatedAt());
    }

    @Test
    void shouldConvertPostDTOWithAllNullFields() {
        // Arrange
        PostDTO postDTO = new PostDTO(null, null, null, null, null);

        // Act
        Post post = postService.convertPostDTOToPost(postDTO);

        // Assert
        assertNull(post.getId());
        assertNull(post.getTitle());
        assertNull(post.getContent());
        assertNull(post.getAuthor());
        assertNull(post.getCreatedAt());
    }
    /*
    @Test
    void shouldThrowWhenUserIsNotAuthorInSubmitPost() {
        // Arrange
        PostDTO postDTO = new PostDTO(1L, "Title", "Content", "originalAuthor", null);
        String user = "anotherUser";

        Post post = new Post();
        post.setId(1L);
        post.setTitle("Title");
        post.setContent("Content");
        post.setAuthor("originalAuthor");

        postService.convertPostDTOToPost(postDTO);

        // Act & Assert
        UserNotAuthorizedException exception = assertThrows(UserNotAuthorizedException.class,
                () -> postService.submitPost(postDTO, user)
        );
        assertEquals("User is not the author of the post", exception.getMessage());
    }

     */

    @Test
    void shouldThrowWhenUserIsNotAuthorInPublishPost() {
        // Arrange
        String user = "anotherUser";

        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor("originalAuthor");
        post.setStatus(PostStatus.ACCEPTED);
        Long postId = postRepository.saveAndFlush(post).getId();

        // Act & Assert
        UserNotAuthorizedException exception = assertThrows(UserNotAuthorizedException.class,
                () -> postService.publishPost(postId, user)
        );
        assertEquals("User is not the author of the post", exception.getMessage());
    }

    @Test
    void shouldThrowWhenPostStatusIsNotAcceptedInPublishPost() {
        // Arrange
        Long postId = 1L;
        String user = "originalAuthor";

        Post post = new Post();
        post.setId(postId);
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor(user);
        post.setStatus(PostStatus.DRAFT);
        postRepository.saveAndFlush(post);

        // Act & Assert
        UserNotAuthorizedException exception = assertThrows(UserNotAuthorizedException.class,
                () -> postService.publishPost(postId, user)
        );
        assertEquals("User is not allowed to publish", exception.getMessage());
    }
    @Test
    void shouldThrowWhenPostNotFoundInUpdatePost() {
        // Arrange
        Long postId = 1L;
        PostUpdateRequest updateDTO = new PostUpdateRequest();
        updateDTO.setContent("Updated Content");
        updateDTO.setTitle("Updated Title");
        String user = "author";

        // Act & Assert
        PostNotFoundException exception = assertThrows(PostNotFoundException.class,
                () -> postService.updatePost(postId, updateDTO, user)
        );
        assertEquals("Post not found", exception.getMessage());
    }

    @Test
    void shouldThrowWhenUserIsNotAuthorInUpdatePost() {
        // Arrange
        String user = "anotherUser";

        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor("originalAuthor");
        long postId = postRepository.saveAndFlush(post).getId();

        PostUpdateRequest updateDTO = new PostUpdateRequest();
        updateDTO.setContent("Updated Content");
        updateDTO.setTitle("Updated Title");
        // Act & Assert
        UserNotAuthorizedException exception = assertThrows(UserNotAuthorizedException.class,
                () -> postService.updatePost(postId, updateDTO, user)
        );
        assertEquals("User is not the author of the post", exception.getMessage());
    }

    @Test
    void shouldNotUpdateIfTitleAndContentAreNullInUpdatePost() {
        // Arrange
        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor("author");
        Long postId = postRepository.saveAndFlush(post).getId();

        PostUpdateRequest updateDTO = new PostUpdateRequest();
        String user = "author";

        // Act
        PostDTO updatedPostDTO = postService.updatePost(postId, updateDTO, user);

        // Assert
        assertEquals("Test Post", updatedPostDTO.title());
        assertEquals("Test Content", updatedPostDTO.content());
    }

    @Test
    void shouldUpdateTitleInUpdatePost() {
        // Arrange
        String user = "author";

        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor(user);
        Long postId = postRepository.saveAndFlush(post).getId();

        PostUpdateRequest updateDTO = new PostUpdateRequest();
        updateDTO.setTitle("Updated Title");
        // Act
        PostDTO updatedPostDTO = postService.updatePost(postId, updateDTO, user);

        // Assert
        assertEquals("Updated Title", updatedPostDTO.title());
        assertEquals("Test Content", updatedPostDTO.content());
    }

    @Test
    void shouldUpdateContentInUpdatePost() {
        // Arrange
        String user = "author";

        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor(user);
        Long postId =postRepository.saveAndFlush(post).getId();

        PostUpdateRequest updateDTO = new PostUpdateRequest();
        updateDTO.setContent("Updated Content");
        // Act
        PostDTO updatedPostDTO = postService.updatePost(postId, updateDTO, user);

        // Assert
        assertEquals("Test Post", updatedPostDTO.title());
        assertEquals("Updated Content", updatedPostDTO.content());
    }

    @Test
    void shouldUpdateTitleAndContentInUpdatePost() {
        // Arrange
        String user = "author";

        Post post = new Post();
        post.setTitle("Test Post");
        post.setContent("Test Content");
        post.setAuthor(user);
        Long postId = postRepository.saveAndFlush(post).getId();

        PostUpdateRequest updateDTO = new PostUpdateRequest();
        updateDTO.setTitle("Updated Title");
        updateDTO.setContent("Updated Content");
        // Act
        PostDTO updatedPostDTO = postService.updatePost(postId, updateDTO, user);

        // Assert
        assertEquals("Updated Title", updatedPostDTO.title());
        assertEquals("Updated Content", updatedPostDTO.content());
    }
}
