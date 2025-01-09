package be.pxl.services.services;

import be.pxl.services.controller.dto.PostReviewDTO;
import be.pxl.services.controller.dto.PostReviewShortMessageDTO;
import be.pxl.services.domain.PostReview;
import be.pxl.services.exception.PostReviewNotFoundException;
import be.pxl.services.config.NotificationClient;
import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.repository.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService implements IReviewService {
    private final ReviewRepository reviewRepository;
    private final NotificationClient notificationClient;
    private static final Logger log = LoggerFactory.getLogger(ReviewService.class.getName());
    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository,
                         NotificationClient notificationClient,
                         RabbitTemplate rabbitTemplate) {
        this.reviewRepository = reviewRepository;
        this.notificationClient = notificationClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = "ReviewQueue")
    public void reviewablePosts(PostReviewDTO postReviewDTO) {
        PostReview postReview = new PostReview();
        postReview.setTitle(postReviewDTO.title());
        postReview.setContent(postReviewDTO.content());
        postReview.setAuthor(postReviewDTO.author());
        postReview.setPostId(postReviewDTO.postId());
        reviewRepository.save(postReview);
        log.info("Post with id: {} saved for review", postReviewDTO.postId());
    }

    public List<PostReviewDTO> getAllReviewablePosts() {
        log.info("Getting all reviews");
        return reviewRepository.findAll()
                .stream()
                .map(postReview -> new PostReviewDTO(
                        postReview.getId(),
                        postReview.getReview(),
                        postReview.getTitle(),
                        postReview.getContent(),
                        postReview.getAuthor(),
                        postReview.getPostId(),
                        postReview.isApproved()
                )
        ).toList();
    }

    @Transactional
    public Void reviewPost(Long id, PostReviewDTO postReviewDTO) {
        log.info("Approving review with id: {}", id);
        PostReview postReview =reviewRepository.findById(id)
                .map(p -> {
                    if (!postReviewDTO.approved()) {
                        p.setReview(postReviewDTO.review());
                    }
                    p.setApproved(postReviewDTO.approved());
                    return p;
                }).orElseThrow(() -> new PostReviewNotFoundException("Post review not found"));

        rabbitTemplate.convertAndSend("PostQueue",new PostReviewShortMessageDTO(postReview.getReview(),
                                                                                     postReview.getPostId(),
                                                                                     postReview.isApproved()));
        log.info("Review sent to post service");

        NotificationDTO notificationDTO = new NotificationDTO(
                "Your post \"" + postReview.getTitle() + "\" has been " + (postReviewDTO.approved() ? "approved" : "rejected"),
                postReview.getAuthor()
        );
        //send notification to author
        notificationClient.sendNotification(notificationDTO);
        //delete review from review service
        reviewRepository.delete(postReview);
        return null;
    }
}
