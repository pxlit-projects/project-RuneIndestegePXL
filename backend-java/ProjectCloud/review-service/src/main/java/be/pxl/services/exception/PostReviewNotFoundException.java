package be.pxl.services.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PostReviewNotFoundException extends RuntimeException {
    public PostReviewNotFoundException(String message) {
        super(message);
    }
}
