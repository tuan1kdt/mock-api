package domain

type MockRepository interface {
	Save(mock *MockAPI) error
	GetByUser(userID string) ([]*MockAPI, error)
	GetByPathAndMethod(userID, path, method string) (*MockAPI, error)
	Update(mock *MockAPI) error
	IncrementHitCount(id string) error
	DeleteExpired() error
	Delete(userID, id string) error
}
