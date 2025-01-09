package be.pxl.services.services;

import be.pxl.services.controller.dto.request.CommentChangeRequest;
import be.pxl.services.controller.dto.request.CommentCreateRequest;
import be.pxl.services.controller.dto.response.CommentResponse;

import java.util.List;

public interface ICommentService {
    List<CommentResponse> getComments(long postId);

    void deleteComment(long commentId, String username);

    void createComment(CommentCreateRequest CommentCreateRequest, String username);

    void updateComment(CommentChangeRequest commentChangeRequest, String username);
}
