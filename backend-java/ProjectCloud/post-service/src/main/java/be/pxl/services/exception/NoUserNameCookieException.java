package be.pxl.services.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class NoUserNameCookieException extends RuntimeException {
    public NoUserNameCookieException(String usernameCookieNotFound) {
        super(usernameCookieNotFound);
    }
}
