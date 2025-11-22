CREATE TABLE IF NOT EXISTS mocks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    response_status INTEGER NOT NULL,
    response_body TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    hit_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_mocks_user_id ON mocks(user_id);
CREATE INDEX IF NOT EXISTS idx_mocks_user_path_method ON mocks(user_id, path, method);
