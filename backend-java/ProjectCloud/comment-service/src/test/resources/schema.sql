CREATE TABLE comments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          content VARCHAR(255) NOT NULL,
                          post_id BIGINT NOT NULL,
                          username VARCHAR(255) NOT NULL
);
