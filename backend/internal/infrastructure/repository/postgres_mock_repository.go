package repository

import (
	"context"
	"fmt"

	"mock-api-backend/internal/domain"
	pgrepo "mock-api-backend/internal/infrastructure/repository/postgres"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresMockRepository struct {
	queries *pgrepo.Queries
}

func NewPostgresMockRepository(pool *pgxpool.Pool) *PostgresMockRepository {
	return &PostgresMockRepository{
		queries: pgrepo.New(pool),
	}
}

func (r *PostgresMockRepository) Save(mock *domain.MockAPI) error {
	var uuid pgtype.UUID
	if err := uuid.Scan(mock.ID); err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}

	expiresAt := pgtype.Timestamp{Time: mock.ExpiresAt, Valid: !mock.ExpiresAt.IsZero()}

	_, err := r.queries.CreateMock(context.Background(), pgrepo.CreateMockParams{
		ID:             uuid,
		UserID:         mock.UserID,
		Method:         mock.Method,
		Path:           mock.Path,
		ResponseStatus: int32(mock.Status),
		ResponseBody:   mock.ResponseBody,
		ExpiresAt:      expiresAt,
	})
	return err
}

func (r *PostgresMockRepository) GetByUser(userID string) ([]*domain.MockAPI, error) {
	mocks, err := r.queries.ListMocksByUser(context.Background(), userID)
	if err != nil {
		return nil, err
	}

	var result []*domain.MockAPI
	for _, m := range mocks {
		result = append(result, toDomainMock(m))
	}
	return result, nil
}

func (r *PostgresMockRepository) GetByPathAndMethod(userID, path, method string) (*domain.MockAPI, error) {
	mock, err := r.queries.GetMockByPathAndMethod(context.Background(), pgrepo.GetMockByPathAndMethodParams{
		UserID: userID,
		Path:   path,
		Method: method,
	})
	if err != nil {
		return nil, err
	}
	return toDomainMock(mock), nil
}

func (r *PostgresMockRepository) IncrementHitCount(id string) error {
	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}
	return r.queries.IncrementHitCount(context.Background(), uuid)
}

func (r *PostgresMockRepository) DeleteExpired() error {
	return r.queries.DeleteExpired(context.Background())
}

func toDomainMock(m pgrepo.Mock) *domain.MockAPI {
	return &domain.MockAPI{
		ID:           uuidToString(m.ID),
		UserID:       m.UserID,
		Method:       m.Method,
		Path:         m.Path,
		Status:       int(m.ResponseStatus),
		ResponseBody: m.ResponseBody,
		HitCount:     int(m.HitCount),
		CreatedAt:    m.CreatedAt.Time,
		ExpiresAt:    m.ExpiresAt.Time,
	}
}

func uuidToString(uuid pgtype.UUID) string {
	if !uuid.Valid {
		return ""
	}
	src := uuid.Bytes
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%12x", src[0:4], src[4:6], src[6:8], src[8:10], src[10:16])
}
