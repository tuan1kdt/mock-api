package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"mock-api-backend/internal/config"
	"mock-api-backend/internal/domain"
	"mock-api-backend/internal/infrastructure/db"
	mockhttp "mock-api-backend/internal/infrastructure/http"
	"mock-api-backend/internal/infrastructure/repository"
	"mock-api-backend/internal/usecase"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Load configuration
	cfg := config.NewConfig()

	// Initialize database connection
	conn, err := db.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer conn.Close()

	// Initialize repository
	postgresRepo := repository.NewPostgresMockRepository(conn)
	var mockRepo domain.MockRepository = postgresRepo

	// Initialize service
	service := usecase.NewMockService(mockRepo)

	// Initialize handler
	handler := mockhttp.NewMockHandler(service)

	// Create routers
	managementRouter := mockhttp.NewManagementRouter(handler)
	servingRouter := mockhttp.NewServingRouter(handler)

	// Get management domain from environment
	managementDomain := os.Getenv("MANAGEMENT_DOMAIN")
	if managementDomain == "" {
		panic("MANAGEMENT_DOMAIN is not set")
	}

	// Create main handler that dispatches based on Host header
	mainHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If Host matches MANAGEMENT_DOMAIN, send to Management router
		start := time.Now()
		defer func() {
			duration := time.Since(start)
			log.Printf("INFO: host=%s method=%s path=%s duration=%s", r.Host, r.Method, r.URL.Path, duration)
		}()
		if r.Host == managementDomain {
			managementRouter.ServeHTTP(w, r)
			return
		}

		// Otherwise, send to Serving router
		servingRouter.ServeHTTP(w, r)
	})

	// Create HTTP server
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: mainHandler,
	}

	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		fmt.Printf("Starting server on port %s\n", cfg.Port)
		fmt.Printf("Management domain: %s\n", managementDomain)
		fmt.Printf("Serving domain: any other domain\n")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	<-sigChan
	fmt.Println("\nShutting down server...")

	// Graceful shutdown
	ctx := context.Background()
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	fmt.Println("Server stopped")
}
