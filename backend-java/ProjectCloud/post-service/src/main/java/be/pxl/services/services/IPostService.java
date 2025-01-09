package be.pxl.services.services;

import be.pxl.services.controller.dto.PostDTO;
import be.pxl.services.controller.request.PostUpdateRequest;
import be.pxl.services.controller.response.PostReviewedResponse;
import jakarta.validation.Valid;

import java.util.List;

public interface IPostService {
    boolean doesPostExist(Long id);

    PostDTO getPublishedPostById(Long id);

    PostDTO createPostAsDraft(@Valid PostDTO post, String user);

    PostDTO publishPost(Long id, String user);

    PostDTO submitPost(@Valid PostDTO post, String user);

    List<PostDTO> getDraftPosts(String user);

    PostDTO updatePost(Long id, @Valid PostUpdateRequest updateDTO, String user);

    List<PostDTO> getPublishedPosts();

    List<PostReviewedResponse> getRejectedPosts(String user);

    List<PostDTO> getApprovedPosts(String user);
}
