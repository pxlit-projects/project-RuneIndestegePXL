package be.pxl.services.controller;

import be.pxl.services.controller.dto.PostReviewDTO;
import be.pxl.services.exception.UserNotAuthorizedException;
import be.pxl.services.services.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin("*")
public class ReviewController {
    private final ReviewService reviewService;
    private static final Logger log = LoggerFactory.getLogger((ReviewController.class.getName()));
    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

//ongeberuikt
    @GetMapping("/{id}")
    public ResponseEntity<PostReviewDTO> getReviewById(@RequestHeader("Role") String role,@PathVariable Long id) {
        checkIfUserEditor(role);
        log.info("Getting review by id: {}", id);
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping
    public ResponseEntity<List<PostReviewDTO>> getAllReviewablePosts(@RequestHeader("Role") String role) {
        checkIfUserEditor(role);
        log.info("Getting all reviewable posts");
        return ResponseEntity.ok(reviewService.getAllReviewablePosts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> approveReview(@RequestHeader String role,@PathVariable Long id, @RequestBody PostReviewDTO postReviewDTO) {
        checkIfUserEditor(role);
        log.info("Reviewing review with id: {}", id);
        return ResponseEntity.ok(reviewService.reviewPost(id, postReviewDTO));
    }
    void checkIfUserEditor(String role) {
        if (!role.equals("head_editor")) {
            throw new UserNotAuthorizedException("User is not head editor");
        }
    }
}
