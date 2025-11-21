package main

import (
	"context"
	"fmt"

	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/fx"

	"mock-api-backend/internal/config"
	"mock-api-backend/internal/domain"
	"mock-api-backend/internal/infrastructure/db"
	mockhttp "mock-api-backend/internal/infrastructure/http"
	"mock-api-backend/internal/infrastructure/repository"
	"mock-api-backend/internal/usecase"
)

type Routers struct {
	fx.In
	Management *gin.Engine `name:"management"`
	Serving    *gin.Engine `name:"serving"`
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	app := fx.New(
		fx.Provide(
			config.NewConfig,
			db.NewPostgresConnection,
			repository.NewPostgresMockRepository,
			// Bind interface to implementation
			func(repo *repository.PostgresMockRepository) domain.MockRepository {
				return repo
			},
			usecase.NewMockService,
			mockhttp.NewMockHandler,
			// Provide named routers
			fx.Annotate(
				mockhttp.NewManagementRouter,
				fx.ResultTags(`name:"management"`),
			),
			fx.Annotate(
				mockhttp.NewServingRouter,
				fx.ResultTags(`name:"serving"`),
			),
		),
		fx.Invoke(registerHooks),
	)

	app.Run()
}

func registerHooks(
	lifecycle fx.Lifecycle,
	cfg *config.Config,
	routers Routers,
) {
	lifecycle.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			// Start Management Server
			go func() {
				fmt.Printf("Starting Management server on port %s\n", cfg.ManagementPort)
				if err := routers.Management.Run(":" + cfg.ManagementPort); err != nil {
					fmt.Printf("Failed to start Management server: %v\n", err)
				}
			}()

			// Start Serving Server
			go func() {
				fmt.Printf("Starting Serving server on port %s\n", cfg.ServingPort)
				if err := routers.Serving.Run(":" + cfg.ServingPort); err != nil {
					fmt.Printf("Failed to start Serving server: %v\n", err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			fmt.Println("Stopping servers...")
			return nil
		},
	})
}
