package be.pxl.services.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostUpdateDTO {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
}
