package be.pxl.services.controller.dto.response;

import java.time.LocalDateTime;

public record CommentDto (
        Long id,
        Long postId,
        String content,
        String username
) {
}
