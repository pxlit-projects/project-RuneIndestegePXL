package be.pxl.services.controller.dto;

public record PostReviewShortMessageDTO(
    String review,
    long postId,
    boolean approved){
}
