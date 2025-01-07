package be.pxl.services.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    private String author;

    private LocalDateTime createdAt;
    @Enumerated(EnumType.STRING)
    @Column(length = 12)
    private PostStatus status = PostStatus.DRAFT;

    private String review = "";

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

