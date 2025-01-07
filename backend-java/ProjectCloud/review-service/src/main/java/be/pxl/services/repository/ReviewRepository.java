package be.pxl.services.repository;

import be.pxl.services.domain.PostReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<PostReview, Long> {
}
