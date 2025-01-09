package be.pxl.services.services;

import be.pxl.services.controller.dto.response.CommentResponse;
import be.pxl.services.controller.dto.request.CommentChangeRequest;
import be.pxl.services.controller.dto.request.CommentCreateRequest;
import be.pxl.services.domain.Comment;
import be.pxl.services.exception.CommentNotFoundException;
import be.pxl.services.exception.NotOwnerCommentException;
import be.pxl.services.exception.PostNotFoundException;
import be.pxl.services.feign.PostClient;
import be.pxl.services.repository.CommentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService implements ICommentService {
    private final CommentRepository commentRepository;
    private final PostClient postClient;
    private static final Logger log = LoggerFactory.getLogger(CommentService.class.getName());

    @Autowired
    public CommentService(CommentRepository commentRepository, PostClient postClient) {
        this.commentRepository = commentRepository;
        this.postClient = postClient;
    }

    public List<CommentResponse> getComments(long postId) {
        return commentRepository.findByPostId(postId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public void deleteComment(long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment with id " + commentId + " does not exist"));
        if(!username.equals(comment.getUsername())){
            log.debug("Comment with id {} does not belong to user {}", commentId, username);
            throw new NotOwnerCommentException("Comment with id " + commentId + " does not belong to user " + username);
        }
        commentRepository.deleteById(commentId);
        log.info("Comment with id: {} deleted", commentId);
    }

    public void createComment(CommentCreateRequest CommentCreateRequest, String username) {
        Comment comment = new Comment(
                CommentCreateRequest.postId(),
                CommentCreateRequest.content(),
                username
        );
        if(!postClient.checkIfPostExists(CommentCreateRequest.postId())){
            log.info("Post with id {} does not exist", CommentCreateRequest.postId());
            throw new PostNotFoundException("Post with id " + CommentCreateRequest.postId() + " does not exist");
        }
        long commentId = commentRepository.save(comment).getId();
        log.info("Comment created {}", commentId);
    }

    public void updateComment(CommentChangeRequest commentChangeRequest, String username) {
        long commentId = commentChangeRequest.id();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment with id " + commentId + " does not exist"));
        if (!comment.getUsername().equals(username)) {
            throw new NotOwnerCommentException("Comment with id " + commentId + " does not belong to user " + username);
        }

        comment.setContent(commentChangeRequest.content());
        commentRepository.save(comment);
        log.info("Comment with id: {} updated", commentId);
    }

    public CommentResponse mapToDto(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getPostId(),
                comment.getContent(),
                comment.getUsername()
        );
    }
}
