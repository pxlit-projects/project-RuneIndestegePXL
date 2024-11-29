package be.pxl.services.repository;

import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    List<Post> findByStatus(PostStatus status);
    List<Post> findByAuthorContainingIgnoreCase(String author);
    List<Post> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
