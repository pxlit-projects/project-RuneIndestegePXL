package be.pxl.services.services;

import be.pxl.services.controller.dto.*;
import be.pxl.services.controller.request.PostUpdateRequest;
import be.pxl.services.controller.response.PostReviewedResponse;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.exception.PostNotFoundException;
import be.pxl.services.exception.UserNotAuthorizedException;
import be.pxl.services.exception.UserNotFoundException;
import be.pxl.services.repository.PostRepository;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService implements IPostService {
    private final PostRepository postRepository;
    private static final Logger log = LoggerFactory.getLogger(PostService.class.getName());
    private final RabbitTemplate rabbitTemplate;
    @Autowired
    public PostService(PostRepository postRepository, RabbitTemplate rabbitTemplate) {
        this.postRepository = postRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = "PostQueue")
    public void reviewedPosts(PostReviewShortMessageDTO reviewPostDTO) {
        Post post = postRepository.findById(reviewPostDTO.postId()).orElseThrow();
        if(reviewPostDTO.approved()) {
            post.setStatus(PostStatus.ACCEPTED);
        } else {
            post.setStatus(PostStatus.REJECTED);
            post.setReview(reviewPostDTO.review());
        }
        log.info("Post with id: {} reviewed", post.getId());
        postRepository.save(post);
    }

    public PostDTO createPostAsDraft(PostDTO postDTO, String user) {
        if (user == null) {
            throw new UserNotFoundException("User is required");
        }
        Post post = convertPostDTOToPost(postDTO);
        post.setAuthor(user);
        post.setStatus(PostStatus.DRAFT);
        post.setReview(null);
        log.info("Post created");
        return convertPostToPostDTO(postRepository.save(post));
    }

    @Transactional
    public PostDTO updatePost(Long id, PostUpdateRequest updateDTO, String user) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        if (!user.equals(existingPost.getAuthor())) {
            log.error("User is not the author of the post");
            throw new UserNotAuthorizedException("User is not the author of the post");
        }
        if (updateDTO.getTitle() != null) {
            existingPost.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getContent() != null) {
            existingPost.setContent(updateDTO.getContent());
        }
        log.info("Post updated");
        return convertPostToPostDTO(postRepository.save(existingPost));
    }

    public List<PostDTO> getPublishedPosts() {
        return convertPostsToPostDTOs(postRepository.findByStatus(PostStatus.PUBLISHED));
    }
    /*
    public List<PostDTO> searchPosts(PostSearchCriteria criteria) {
        Specification<Post> spec = Specification.where(PostSpecifications.hasStatus(PostStatus.PUBLISHED))
                .and(PostSpecifications.withAuthor(criteria.getAuthor()))
                .and(PostSpecifications.withContent(criteria.getContent()))
                .and(PostSpecifications.withDateBetween(criteria.getStartDate(), criteria.getEndDate()));

        return convertPostsToPostDTOs(postRepository.findAll(spec));
    }
*/
    public PostDTO publishPost(Long id, String user) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        if (!user.equals(post.getAuthor())) {
            log.error("User is not the author of the post");
            throw new UserNotAuthorizedException("User is not the author of the post");
        }
        if(post.getStatus() != PostStatus.ACCEPTED) {
            log.error("User is not allowed to publish");
            throw new UserNotAuthorizedException("User is not allowed to publish");
        }
        post.setStatus(PostStatus.PUBLISHED);
        log.info("Post published");
        return convertPostToPostDTO(postRepository.save(post));
    }

    @Transactional
    public PostDTO submitPost(PostDTO postDTO, String user) {
        Post post = convertPostDTOToPost(postDTO);
        /*Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        */
        if (post.getAuthor() != null && !user.equals(post.getAuthor()) && post.getAuthor().isEmpty()) {
            log.error("User is not the author of the post");
            throw new UserNotAuthorizedException("User is not the author of the post");
        }
        post.setReview(null);
        post.setAuthor(user);
        post.setStatus(PostStatus.SUBMITTED);
        // save for if it not has been a draft it gets an id from this point
        Post sendOutPost = postRepository.save(post);
        //publish to review
        rabbitTemplate.convertAndSend("ReviewQueue", new PostReviewMessageDTO(
                "",
                sendOutPost.getTitle(),
                sendOutPost.getContent(),
                sendOutPost.getAuthor(),
                sendOutPost.getId(),
                false));
        log.info("Post submitted");
        return convertPostToPostDTO(sendOutPost);
    }

    public Post convertPostDTOToPost(PostDTO postDTO) {
        Post post = new Post();
        if(!(postDTO.id() == null)) {
            post.setId(postDTO.id());
        }
        post.setTitle(postDTO.title());
        post.setContent(postDTO.content());
        if(!(postDTO.author() == null)) {
            post.setAuthor(postDTO.author());
        }
        if(!(postDTO.createdAt() == null)) {
            post.setCreatedAt(postDTO.createdAt());
        }
        return post;
    }

    public PostDTO convertPostToPostDTO(Post post) {
        return new PostDTO(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor(),
                post.getCreatedAt()
        );
    }

    public List<PostDTO> convertPostsToPostDTOs(List<Post> posts) {
        return posts.stream().map(this::convertPostToPostDTO).collect(Collectors.toList());
    }

    public boolean doesPostExist(Long id) {
        log.info("Checking if post exists id: {}", id);
        return postRepository.findById(id)
                .map(post -> post.getStatus() == PostStatus.PUBLISHED)
                .orElse(false);
    }

    public List<PostDTO> getDraftPosts(String user) {
        return convertPostsToPostDTOs(postRepository.findByAuthorAndStatus(user, PostStatus.DRAFT));
    }

    public List<PostDTO> getApprovedPosts(String user) {
        return convertPostsToPostDTOs(postRepository.findByAuthorAndStatus(user, PostStatus.ACCEPTED));
    }
    public List<PostReviewedResponse> getRejectedPosts(String user) {
        return convertPostsToPostReviewedResponses(postRepository.findByAuthorAndStatus(user, PostStatus.REJECTED));
    }
    public List<PostReviewedResponse> convertPostsToPostReviewedResponses(List<Post> posts) {
        return posts.stream()
                .map(this::convertPostToPostReviewedResponse)
                .collect(Collectors.toList());
    }
    public PostReviewedResponse convertPostToPostReviewedResponse(Post post) {
        return new PostReviewedResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor(),
                post.getCreatedAt(),
                post.getStatus() == PostStatus.ACCEPTED,
                post.getReview()
        );
    }

    public PostDTO getPublishedPostById(Long id) {
        return postRepository.findById(id)
                .filter(post -> post.getStatus() == PostStatus.PUBLISHED)
                .map(this::convertPostToPostDTO)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
    }
}

