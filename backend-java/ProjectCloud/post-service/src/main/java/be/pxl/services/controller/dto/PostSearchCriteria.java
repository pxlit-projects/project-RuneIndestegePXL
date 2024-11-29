package be.pxl.services.controller.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostSearchCriteria {
    private String author;
    private String content;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
