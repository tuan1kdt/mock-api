-- name: CreateMock :one
INSERT INTO mocks (id, user_id, method, path, response_status, response_body, expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetMock :one
SELECT * FROM mocks
WHERE id = $1 LIMIT 1;

-- name: GetMockByPathAndMethod :one
SELECT * FROM mocks
WHERE user_id = $1 AND path = $2 AND method = $3
ORDER BY created_at DESC
LIMIT 1;

-- name: ListMocksByUser :many
SELECT * FROM mocks
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: IncrementHitCount :exec
UPDATE mocks
SET hit_count = hit_count + 1
WHERE id = $1;

-- name: DeleteExpired :exec
DELETE FROM mocks
WHERE expires_at < NOW();

-- name: DeleteMock :exec
DELETE FROM mocks
WHERE id = $1;
