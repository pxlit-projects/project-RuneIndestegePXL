package be.pxl.services.controller.dto.request;

public record CommentCreateRequest  (
        Long postId,
        String content) {
}
