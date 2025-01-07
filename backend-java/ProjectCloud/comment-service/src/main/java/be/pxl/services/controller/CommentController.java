package be.pxl.services.controller;


import be.pxl.services.controller.dto.request.CommentChangeRequest;
import be.pxl.services.controller.dto.request.CommentCreateRequest;
import be.pxl.services.controller.dto.response.CommentDto;
import be.pxl.services.services.CommentService;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin("*")
public class CommentController {
    private final CommentService commentService;
    private static final Logger log = LoggerFactory.getLogger(CommentController.class.getName());

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable long postId) {
        log.info("Getting comments for post with id: {}", postId);
        List<CommentDto> comments = commentService.getComments(postId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable long commentId,
                                              @RequestHeader("User") String username) {
        log.info("Deleting comment with id: {}", commentId);
        commentService.deleteComment(commentId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Void> createComment(@RequestBody CommentCreateRequest commentCreateRequest,
                                              @RequestHeader("User") String username) {
        log.info("Creating comment by user: {}", username);
        commentService.createComment(commentCreateRequest, username);
        return ResponseEntity.status(201).build();
    }

    @PutMapping
    public ResponseEntity<Void> updateComment(@RequestBody CommentChangeRequest commentChangeRequest,
                                              @RequestHeader("User") String username) {
        log.info("Updating comment with id: {}", commentChangeRequest.id());
        commentService.updateComment(commentChangeRequest, username);
        return ResponseEntity.noContent().build();
    }

}
