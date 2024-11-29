package be.pxl.services.services;

import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;

public class PostSpecifications {
    public static Specification<Post> withAuthor(String author) {
        return (root, query, cb) ->
                author == null ? null : cb.like(cb.lower(root.get("author")), "%" + author.toLowerCase() + "%");
    }

    public static Specification<Post> withContent(String content) {
        return (root, query, cb) ->
                content == null ? null : cb.like(cb.lower(root.get("content")), "%" + content.toLowerCase() + "%");
    }

    public static Specification<Post> withDateBetween(LocalDateTime start, LocalDateTime end) {
        return (root, query, cb) ->
                start == null || end == null ? null : cb.between(root.get("createdAt"), start, end);
    }

    public static Specification<Post> hasStatus(PostStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }
}
