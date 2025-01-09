package be.pxl.services.services;

import be.pxl.services.controller.dto.PostReviewDTO;

import java.util.List;

public interface IReviewService {

    List<PostReviewDTO> getAllReviewablePosts();

    Void reviewPost(Long id, PostReviewDTO postReviewDTO);
}
