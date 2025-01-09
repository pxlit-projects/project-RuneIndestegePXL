package be.pxl.services.controller.dto.response;

public record CommentResponse(
        Long id,
        Long postId,
        String content,
        String username
) {
}
