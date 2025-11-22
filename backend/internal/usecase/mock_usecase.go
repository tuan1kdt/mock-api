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
	// Check for duplicate
	existing, err := s.repo.GetByPathAndMethod(userID, path, method)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, domain.ErrMockAlreadyExists
	}

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

func (s *MockService) UpdateMock(userID, id, path, method, responseBody string, status int) (*domain.MockAPI, error) {
	// Verify ownership and existence
	// Since we don't have GetByIDAndUser, we can list by user and find, or just try to update if we had that query.
	// But we have UpdateMock query that checks ID and UserID.
	// However, we need to return the updated mock.
	// Let's construct the object. We might need to fetch it first to get CreatedAt etc if we want to return full object,
	// or just return what we updated.
	// The UpdateMock query returns * so we can use that if we exposed it in repo.
	// But repo Update takes *domain.MockAPI.
	// Let's fetch first to ensure it exists and belongs to user (or just rely on repo update affecting 0 rows if not found?
	// Repo Update returns error if something fails, but standard Update usually doesn't return "not found" as error unless we check rows affected.
	// Let's assume for now we want to be safe.
	// Actually, the repo Update implementation uses `queries.UpdateMock` which returns `*`, but the repo method signature is `Update(mock *domain.MockAPI) error`.
	// It doesn't return the updated object from DB.
	// So we should probably fetch it first to make sure we are updating the right thing and preserving other fields like CreatedAt.

	// Wait, `GetByPathAndMethod` is not enough to find by ID.
	// We have `GetByUser`.
	// Let's add `GetByID` to repo if we want to be precise, or just iterate `GetByUser`.
	// For MVP, iterating `GetByUser` is fine as list is small.

	mocks, err := s.repo.GetByUser(userID)
	if err != nil {
		return nil, err
	}

	var targetMock *domain.MockAPI
	for _, m := range mocks {
		if m.ID == id {
			targetMock = m
			break
		}
	}

	if targetMock == nil {
		return nil, domain.ErrMockNotFound
	}

	// Check for duplicate path/method if changed
	if targetMock.Path != path || targetMock.Method != method {
		existing, err := s.repo.GetByPathAndMethod(userID, path, method)
		if err != nil {
			return nil, err
		}
		if existing != nil && existing.ID != id {
			return nil, domain.ErrMockAlreadyExists
		}
	}

	targetMock.Path = path
	targetMock.Method = method
	targetMock.Status = status
	targetMock.ResponseBody = responseBody

	if err := s.repo.Update(targetMock); err != nil {
		return nil, err
	}

	return targetMock, nil
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
