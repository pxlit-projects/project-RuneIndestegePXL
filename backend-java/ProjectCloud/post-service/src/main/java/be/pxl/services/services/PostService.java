package be.pxl.services.services;

import be.pxl.services.controller.dto.PostDTO;
import be.pxl.services.controller.dto.PostSearchCriteria;
import be.pxl.services.controller.dto.PostUpdateDTO;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.exception.PostNotFoundException;
import be.pxl.services.exception.UserNotAuthorizedException;
import be.pxl.services.exception.UserNotFoundException;
import be.pxl.services.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {
    private final PostRepository postRepository;

    // US1 + 2: Create new post as draft
    public PostDTO createPost(PostDTO postDTO, String user) {
        if (user == null) {
            throw new UserNotFoundException("User is required");
        }
        postDTO.setAuthor(user);
        Post post = convertPostDTOToPost(postDTO);
        post.setStatus(PostStatus.DRAFT);
        return convertPostToPostDTO(postRepository.save(post));
    }

    // US3: Edit post
    public PostDTO updatePost(Long id, PostUpdateDTO updateDTO, String user) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        if (!user.equals(existingPost.getAuthor())) {
            throw new UserNotAuthorizedException("User is not the author of the post");
        }
        if (updateDTO.getTitle() != null) {
            existingPost.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getContent() != null) {
            existingPost.setContent(updateDTO.getContent());
        }
        return convertPostToPostDTO(postRepository.save(existingPost));
    }

    // US4: Get published posts
    public List<PostDTO> getPublishedPosts() {
        return convertPostsToPostDTOs(postRepository.findByStatus(PostStatus.PUBLISHED));
    }

    // US5: Filter posts
    public List<PostDTO> searchPosts(PostSearchCriteria criteria) {
        Specification<Post> spec = Specification.where(PostSpecifications.hasStatus(PostStatus.PUBLISHED))
                .and(PostSpecifications.withAuthor(criteria.getAuthor()))
                .and(PostSpecifications.withContent(criteria.getContent()))
                .and(PostSpecifications.withDateBetween(criteria.getStartDate(), criteria.getEndDate()));

        return convertPostsToPostDTOs(postRepository.findAll(spec));
    }

    public Post convertPostDTOToPost(PostDTO postDTO) {
        Post post = new Post();
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setAuthor(postDTO.getAuthor());
        post.setStatus(PostStatus.valueOf(postDTO.getStatus()));
        return post;
    }

    public PostDTO convertPostToPostDTO(Post post) {
        PostDTO postDTO = new PostDTO();
        postDTO.setTitle(post.getTitle());
        postDTO.setContent(post.getContent());
        postDTO.setAuthor(post.getAuthor());
        postDTO.setStatus(String.valueOf(post.getStatus()));
        return postDTO;
    }

    public List<PostDTO> convertPostsToPostDTOs(List<Post> posts) {
        return posts.stream().map(this::convertPostToPostDTO).collect(Collectors.toList());
    }
    public List<Post> convertPostsDTOsToPost(List<PostDTO> postsDTO) {
        return postsDTO.stream().map(this::convertPostDTOToPost).collect(Collectors.toList());
    }

    public PostDTO publishPost(Long id, String user) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        if (!user.equals(post.getAuthor())) {
            throw new UserNotAuthorizedException("User is not the author of the post");
        }
        post.setStatus(PostStatus.PUBLISHED);
        return convertPostToPostDTO(postRepository.save(post));
    }
}

