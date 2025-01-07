package be.pxl.services.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostUpdateRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
}
