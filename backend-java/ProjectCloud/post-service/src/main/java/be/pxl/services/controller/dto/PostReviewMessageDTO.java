package be.pxl.services.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public record PostReviewMessageDTO (
        String review,
        String title,
        String content,
        String author,
        long postId,
        boolean approved){
}
