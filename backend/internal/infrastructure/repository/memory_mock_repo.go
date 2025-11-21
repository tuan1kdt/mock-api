package repository

import (
	"sync"
	"time"

	"mock-api-backend/internal/domain"
)

type InMemoryMockRepository struct {
	mu    sync.RWMutex
	mocks map[string]*domain.MockAPI
}

func NewInMemoryMockRepository() *InMemoryMockRepository {
	return &InMemoryMockRepository{
		mocks: make(map[string]*domain.MockAPI),
	}
}

func (r *InMemoryMockRepository) Save(mock *domain.MockAPI) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.mocks[mock.ID] = mock
	return nil
}

func (r *InMemoryMockRepository) GetByUser(userID string) ([]*domain.MockAPI, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*domain.MockAPI
	for _, mock := range r.mocks {
		if mock.UserID == userID {
			result = append(result, mock)
		}
	}
	return result, nil
}

func (r *InMemoryMockRepository) GetByPathAndMethod(userID, path, method string) (*domain.MockAPI, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, mock := range r.mocks {
		if mock.UserID == userID && mock.Path == path && mock.Method == method {
			return mock, nil
		}
	}
	return nil, nil
}

func (r *InMemoryMockRepository) IncrementHitCount(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if mock, exists := r.mocks[id]; exists {
		mock.HitCount++
	}
	return nil
}

func (r *InMemoryMockRepository) DeleteExpired() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	for id, mock := range r.mocks {
		if now.After(mock.ExpiresAt) {
			delete(r.mocks, id)
		}
	}
	return nil
}
