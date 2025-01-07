package be.pxl.services.controller.response;

import java.time.LocalDateTime;

public record PostReviewedResponse(
        Long id,
        String title,
        String content,
        String author,
        LocalDateTime createdAt,
        boolean approved,
        String review
){
}
