package http

import (
	"net/http"
	"strings"
)

func NewManagementRouter(handler *MockHandler) http.Handler {
	mux := http.NewServeMux()

	api := authMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		switch {
		case path == "/api/mocks" && r.Method == http.MethodPost:
			handler.CreateMock(w, r)
		case path == "/api/mocks" && r.Method == http.MethodGet:
			handler.ListMocks(w, r)
		case strings.HasPrefix(path, "/api/mocks/") && r.Method == http.MethodPut:
			handler.UpdateMock(w, r)
		case strings.HasPrefix(path, "/api/mocks/") && r.Method == http.MethodDelete:
			handler.DeleteMock(w, r)
		default:
			http.NotFound(w, r)
		}
	}))

	mux.Handle("/api/", api)
	return mux
}

func NewServingRouter(handler *MockHandler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeMock(w, r)
	})
}
