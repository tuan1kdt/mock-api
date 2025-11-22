package domain

import "errors"

var (
	ErrMockAlreadyExists = errors.New("mock endpoint already exists")
	ErrMockNotFound      = errors.New("mock endpoint not found")
)
