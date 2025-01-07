package be.pxl.services.controller.dto;

public record PostReviewDTO(
        Long id,
        String review,
        String title,
        String content,
        String author,
        Long postId,
        boolean approved) {
}
