package http

import (
	"net/http"
	"slices"
	"strings"
)

func corsMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
	allowAll := slices.Contains(allowedOrigins, "*")

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" {
				if allowAll || slices.Contains(allowedOrigins, origin) {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					w.Header().Set("Access-Control-Allow-Credentials", "true")
					w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
					w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
					w.Header().Set("Vary", "Origin")
				}
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func NewManagementRouter(handler *MockHandler, allowedOrigins []string) http.Handler {
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
	return corsMiddleware(allowedOrigins)(mux)
}

func NewServingRouter(handler *MockHandler, allowedOrigins []string) http.Handler {
	return corsMiddleware(allowedOrigins)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeMock(w, r)
	}))
}
