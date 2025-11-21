package usecase

import (
	"time"

	"mock-api-backend/internal/domain"

	"github.com/google/uuid"
)

type MockService struct {
	repo domain.MockRepository
}

func NewMockService(repo domain.MockRepository) *MockService {
	return &MockService{repo: repo}
}

func (s *MockService) CreateMock(userID, path, method, responseBody string, status int) (*domain.MockAPI, error) {
	mock := &domain.MockAPI{
		ID:           uuid.New().String(),
		UserID:       userID,
		Path:         path,
		Method:       method,
		Status:       status,
		ResponseBody: responseBody,
		CreatedAt:    time.Now(),
		ExpiresAt:    time.Now().Add(10 * time.Minute), // 10 minutes TTL
		HitCount:     0,
	}

	if err := s.repo.Save(mock); err != nil {
		return nil, err
	}

	return mock, nil
}

func (s *MockService) GetMocks(userID string) ([]*domain.MockAPI, error) {
	return s.repo.GetByUser(userID)
}

func (s *MockService) GetMockForServing(userID, path, method string) (*domain.MockAPI, error) {
	mock, err := s.repo.GetByPathAndMethod(userID, path, method)
	if err != nil {
		return nil, err
	}
	if mock != nil {
		_ = s.repo.IncrementHitCount(mock.ID)
	}
	return mock, nil
}

func (s *MockService) CleanupExpired() error {
	return s.repo.DeleteExpired()
}
