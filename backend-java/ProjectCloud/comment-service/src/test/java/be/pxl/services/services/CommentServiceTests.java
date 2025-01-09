package be.pxl.services.services;


import be.pxl.services.controller.dto.request.CommentCreateRequest;
import be.pxl.services.controller.dto.response.CommentResponse;
import be.pxl.services.domain.Comment;
import be.pxl.services.exception.CommentNotFoundException;
import be.pxl.services.exception.NotOwnerCommentException;
import be.pxl.services.exception.PostNotFoundException;
import be.pxl.services.feign.PostClient;
import be.pxl.services.repository.CommentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@Testcontainers
@AutoConfigureMockMvc
public class CommentServiceTests {

    @Autowired
    private CommentService commentService;

    @MockBean
    private PostClient postClient;

    @Autowired
    private CommentRepository commentRepository;

    @Container
    private static MySQLContainer sqlContainer = new MySQLContainer("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");


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
        commentRepository.deleteAll();
        //MockitoAnnotations.openMocks(this);
        //when(postClient.checkIfPostExists(any())).thenReturn(true);
    }

    @Test
    void testDeleteComment_CommentNotFoundException() {
        assertThrows(CommentNotFoundException.class, () -> commentService.deleteComment(1L, "testUser"));
    }

    @Test
    void testDeleteComment_NotOwnerCommentException() {
        Comment comment = new Comment(1L, "Test content", "anotherUser");
        comment.setId(1L);
        Comment comment1=commentRepository.save(comment);
        //when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        assertThrows(NotOwnerCommentException.class, () -> commentService.deleteComment(comment1.getId(), "testUser"));
    }

    @Test
    void testDeleteComment_Success() {
        Comment comment = new Comment(1L, "Test content", "testUser");
        comment.setId(1L);

        commentRepository.save(comment);
        //when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        Comment comment1 = commentRepository.findById(1L).orElseThrow();

        commentService.deleteComment(1L, "testUser");
        assertEquals(comment1, comment);
        assertThrows(RuntimeException.class, ()->commentRepository.findById(1L).orElseThrow(RuntimeException::new));
    }

    @Test
    void testMapToDto() {
        Comment comment = new Comment(1L, "Test content", "testUser");
        comment.setId(1L);

        CommentResponse response = commentService.mapToDto(comment);

        assertEquals(1L, response.id());
        assertEquals(1L, response.postId());
        assertEquals("Test content", response.content());
        assertEquals("testUser", response.username());
    }


    @Test
    void testCreateComment_PostNotFoundException() {
        CommentCreateRequest request = new CommentCreateRequest(1L, "Test content");
        //when(postClient.checkIfPostExists(anyLong())).thenReturn(false);

        assertThrows(PostNotFoundException.class, () -> commentService.createComment(request, "testUser"));
    }
}
