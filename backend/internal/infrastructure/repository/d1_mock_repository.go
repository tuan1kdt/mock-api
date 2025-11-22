//go:build js && wasm

package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"mock-api-backend/internal/domain"

	"github.com/syumai/workers/cloudflare/d1"
)

type D1MockRepository struct {
	db *sql.DB
}

func NewD1MockRepository(bindingName string) (*D1MockRepository, error) {
	c, err := d1.OpenConnector(bindingName)
	if err != nil {
		return nil, fmt.Errorf("failed to open d1 connector: %w", err)
	}
	db := sql.OpenDB(c)
	return &D1MockRepository{db: db}, nil
}

func (r *D1MockRepository) Save(mock *domain.MockAPI) error {
	query := `
		INSERT INTO mocks (id, user_id, method, path, response_status, response_body, created_at, expires_at, hit_count)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.ExecContext(context.Background(), query,
		mock.ID,
		mock.UserID,
		mock.Method,
		mock.Path,
		mock.Status,
		mock.ResponseBody,
		mock.CreatedAt,
		mock.ExpiresAt,
		mock.HitCount,
	)
	return err
}

func (r *D1MockRepository) Update(mock *domain.MockAPI) error {
	query := `
		UPDATE mocks
		SET user_id = ?, method = ?, path = ?, response_status = ?, response_body = ?
		WHERE id = ?
	`
	_, err := r.db.ExecContext(context.Background(), query,
		mock.UserID,
		mock.Method,
		mock.Path,
		mock.Status,
		mock.ResponseBody,
		mock.ID,
	)
	return err
}

func (r *D1MockRepository) GetByUser(userID string) ([]*domain.MockAPI, error) {
	query := `
		SELECT id, user_id, method, path, response_status, response_body, created_at, expires_at, hit_count
		FROM mocks
		WHERE user_id = ?
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mocks []*domain.MockAPI
	for rows.Next() {
		var m domain.MockAPI
		var createdAt, expiresAt time.Time
		if err := rows.Scan(
			&m.ID,
			&m.UserID,
			&m.Method,
			&m.Path,
			&m.Status,
			&m.ResponseBody,
			&createdAt,
			&expiresAt,
			&m.HitCount,
		); err != nil {
			return nil, err
		}
		m.CreatedAt = createdAt
		m.ExpiresAt = expiresAt
		mocks = append(mocks, &m)
	}
	return mocks, nil
}

func (r *D1MockRepository) GetByPathAndMethod(userID, path, method string) (*domain.MockAPI, error) {
	query := `
		SELECT id, user_id, method, path, response_status, response_body, created_at, expires_at, hit_count
		FROM mocks
		WHERE user_id = ? AND path = ? AND method = ?
	`
	row := r.db.QueryRowContext(context.Background(), query, userID, path, method)

	var m domain.MockAPI
	var createdAt, expiresAt time.Time
	if err := row.Scan(
		&m.ID,
		&m.UserID,
		&m.Method,
		&m.Path,
		&m.Status,
		&m.ResponseBody,
		&createdAt,
		&expiresAt,
		&m.HitCount,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	m.CreatedAt = createdAt
	m.ExpiresAt = expiresAt
	return &m, nil
}

func (r *D1MockRepository) IncrementHitCount(id string) error {
	query := `UPDATE mocks SET hit_count = hit_count + 1 WHERE id = ?`
	_, err := r.db.ExecContext(context.Background(), query, id)
	return err
}

func (r *D1MockRepository) DeleteExpired() error {
	query := `DELETE FROM mocks WHERE expires_at < ?`
	_, err := r.db.ExecContext(context.Background(), query, time.Now())
	return err
}

func (r *D1MockRepository) Delete(userID, id string) error {
	query := `DELETE FROM mocks WHERE id = ? AND user_id = ?`
	_, err := r.db.ExecContext(context.Background(), query, id, userID)
	return err
}
