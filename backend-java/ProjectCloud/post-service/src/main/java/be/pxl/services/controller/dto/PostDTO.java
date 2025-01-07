package be.pxl.services.controller.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;


public record PostDTO (
    Long id,
    @NotBlank(message = "title cant be blank")
    String title,
    @NotBlank(message = "title cant be blank")
    String content,
    String author,
    LocalDateTime createdAt
){
}

