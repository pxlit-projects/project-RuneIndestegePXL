package be.pxl.services.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostDTO {
    private Long id;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private String status;
}

