package be.pxl.services.controller;

import be.pxl.services.controller.dto.PostDTO;
import be.pxl.services.controller.response.PostReviewedResponse;
import be.pxl.services.controller.request.PostUpdateRequest;
import be.pxl.services.exception.UserNotAuthorizedException;
import be.pxl.services.services.IPostService;
import be.pxl.services.services.PostService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
//@CrossOrigin("*")
public class PostController {
    private final IPostService postService;
    private static final Logger log = LoggerFactory.getLogger(PostController.class.getName());

    @Autowired
    public PostController(IPostService postService) {
        this.postService = postService;
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> checkIfPostExists(@PathVariable Long id) {
        log.info("Checking if post with id: {} exists", id);

        return ResponseEntity.ok(postService.doesPostExist(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPublishedPostById(@PathVariable Long id) {
        log.info("Getting post with id: {}", id);
        PostDTO post = postService.getPublishedPostById(id);
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPostAsDraft(
            @Valid @RequestBody PostDTO post,
            @RequestHeader("User") String user,
            @RequestHeader("Role") String role) {
        log.info("Creating post as draft");
        checkIfUserEditor(role);
        PostDTO createdPost = postService.createPostAsDraft(post, user);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<PostDTO> publishPost(
            @PathVariable Long id,
            @RequestHeader("Role") String role,
            @RequestHeader("User") String user) {
        log.info("Publishing post with id: {}", id);
        checkIfUserEditor(role);

        PostDTO publishedPost = postService.publishPost(id, user);
        return ResponseEntity.ok(publishedPost);
    }

    @PutMapping("/submit")
    public ResponseEntity<PostDTO> submitPost(
            @Valid @RequestBody PostDTO post,
            @RequestHeader("User") String user,
            @RequestHeader("Role") String role) {
        log.info("Submitting post {}", user);
        checkIfUserEditor(role);

        PostDTO submittedPost = postService.submitPost(post, user);
        return ResponseEntity.ok(submittedPost);
    }

    @GetMapping("/draft/all")
    public ResponseEntity<List<PostDTO>> getDraftPosts(@RequestHeader("User") String user) {
        log.info("Getting draft posts for user: {}", user);
        List<PostDTO> posts = postService.getDraftPosts(user);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> correctPost(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest updateDTO,
            @RequestHeader("User") String user,
            @RequestHeader("Role") String role) {
        log.info("Updating post with id: {}", id);
        checkIfUserEditor(role);
        PostDTO updatedPost = postService.updatePost(id, updateDTO, user);
        return ResponseEntity.ok(updatedPost);
    }

    @GetMapping("/published")
    public ResponseEntity<List<PostDTO>> getPublishedPosts() {
        log.info("Getting published posts");
        List<PostDTO> posts = postService.getPublishedPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/rejected")
    public ResponseEntity<List<PostReviewedResponse>> getRejectedPosts(@RequestHeader("User") String user) {
        log.info("Getting rejected posts for user: {}", user);
        List<PostReviewedResponse> posts = postService.getRejectedPosts(user);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<PostDTO>> getApprovedPosts(@RequestHeader("User") String user) {
        log.info("Getting approved posts for user: {}", user);
        List<PostDTO> posts = postService.getApprovedPosts(user);
        return ResponseEntity.ok(posts);
    }

    public void checkIfUserEditor(String role){
        if (!role.equals("editor") && !role.equals("head_editor")) {
            throw new UserNotAuthorizedException("User is not a editor");
        }
    }
}