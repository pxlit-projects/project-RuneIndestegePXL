package be.pxl.services.controller;

import be.pxl.services.controller.dto.PostDTO;
import be.pxl.services.controller.dto.PostSearchCriteria;
import be.pxl.services.controller.dto.PostUpdateDTO;
import be.pxl.services.services.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    // US1 + US2: Create new post as draft
    @PostMapping
    public ResponseEntity<PostDTO> createPostAsDraft(
            @Valid @RequestBody PostDTO post,
            @RequestHeader("User") String user) {
        PostDTO createdPost = postService.createPost(post, user);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<PostDTO> publishPost(
            @PathVariable Long id,
            @RequestHeader("User") String user) {
        PostDTO publishedPost = postService.publishPost(id, user);
        return ResponseEntity.ok(publishedPost);
    }

    // US3: Edit post
    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateDTO updateDTO,
            @RequestHeader("User") String user) {
        PostDTO updatedPost = postService.updatePost(id, updateDTO, user);
        return ResponseEntity.ok(updatedPost);
    }

    // US4: Get published posts
    @GetMapping("/published")
    public ResponseEntity<List<PostDTO>> getPublishedPosts() {
        List<PostDTO> posts = postService.getPublishedPosts();
        return ResponseEntity.ok(posts);
    }

    // US5: Filter posts
    @GetMapping("/search")
    public ResponseEntity<List<PostDTO>> searchPosts(
            @ModelAttribute PostSearchCriteria criteria) {
        List<PostDTO> posts = postService.searchPosts(criteria);
        return ResponseEntity.ok(posts);
    }
}