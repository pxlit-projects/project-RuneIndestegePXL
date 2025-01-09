package be.pxl.services.controller.dto;


import jakarta.validation.constraints.NotEmpty;

public record NotificationDTO(
        long id,
        @NotEmpty
        String message,
        @NotEmpty
        String author){
}
