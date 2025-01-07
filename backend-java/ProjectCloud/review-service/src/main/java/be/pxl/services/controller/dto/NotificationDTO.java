package be.pxl.services.controller.dto;


import jakarta.validation.constraints.NotEmpty;

public record NotificationDTO(
        @NotEmpty
        String message,
        @NotEmpty
        String author,
        @NotEmpty
        Long postId){

}
