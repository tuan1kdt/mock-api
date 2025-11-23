//go:build js && wasm

package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/syumai/workers"

	"mock-api-backend/internal/domain"
	mockhttp "mock-api-backend/internal/infrastructure/http"
	"mock-api-backend/internal/infrastructure/repository"
	"mock-api-backend/internal/usecase"

	"github.com/syumai/workers/cloudflare"
)

func main() {
	// Initialize D1 Repository
	d1Repo, err := repository.NewD1MockRepository("DB")
	if err != nil {
		panic(err)
	}

	// Bind interface to implementation
	var mockRepo domain.MockRepository = d1Repo

	// Initialize service
	service := usecase.NewMockService(mockRepo)

	// Get configuration from environment
	scheme := cloudflare.Getenv("SCHEME")
	if scheme == "<undefined>" {
		scheme = "https"
	}

	managementDomain := cloudflare.Getenv("MANAGEMENT_DOMAIN")
	if managementDomain == "" {
		panic("MANAGEMENT_DOMAIN is not set")
	}

	allowedOrigins := parseAllowedOrigins(cloudflare.Getenv("ALLOWED_ORIGINS"))

	// Initialize handler with config
	handler := mockhttp.NewMockHandler(service, scheme, managementDomain)

	// Create routers
	managementRouter := mockhttp.NewManagementRouter(handler, allowedOrigins)
	servingRouter := mockhttp.NewServingRouter(handler, allowedOrigins)

	// Create main handler that dispatches based on Host header
	mainHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Host: ", r.Host)
		fmt.Println("AllowedOrigins: ", allowedOrigins)
		// If Host matches MANAGEMENT_DOMAIN, send to Management router
		if r.Host == managementDomain {
			managementRouter.ServeHTTP(w, r)
			return
		}

		// Otherwise, send to Serving router
		servingRouter.ServeHTTP(w, r)
	})

	// Start the worker
	workers.Serve(mainHandler)
}

func parseAllowedOrigins(raw string) []string {
	if raw == "" || raw == "<undefined>" {
		return []string{"*"}
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
