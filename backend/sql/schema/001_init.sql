CREATE TABLE mocks (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    response_status INT NOT NULL,
    response_body TEXT NOT NULL,
    hit_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_mocks_path_method ON mocks (path, method);
CREATE INDEX idx_mocks_user_id ON mocks (user_id);
