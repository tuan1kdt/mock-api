//go:build js && wasm

package main

import (
	"net/http"

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

	// Initialize handler
	handler := mockhttp.NewMockHandler(service)

	// Create routers
	managementRouter := mockhttp.NewManagementRouter(handler)
	servingRouter := mockhttp.NewServingRouter(handler)

	managementDomain := cloudflare.Getenv("MANAGEMENT_DOMAIN")
	if managementDomain == "" {
		panic("MANAGEMENT_DOMAIN is not set")
	}

	// Create main handler that dispatches based on Host header
	mainHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
