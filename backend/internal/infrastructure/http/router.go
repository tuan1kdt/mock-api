package http

import (
	"github.com/gin-gonic/gin"
)

func NewManagementRouter(handler *MockHandler) *gin.Engine {
	r := gin.Default()

	r.Use(AuthMiddleware())

	api := r.Group("/api")
	{
		api.POST("/mocks", handler.CreateMock)
		api.GET("/mocks", handler.ListMocks)
		api.PUT("/mocks/:id", handler.UpdateMock)
		api.DELETE("/mocks/:id", handler.DeleteMock)
	}

	return r
}

func NewServingRouter(handler *MockHandler) *gin.Engine {
	r := gin.Default()

	r.Use(SubdomainAuthMiddleware())

	// Serve everything
	r.Any("/*path", handler.ServeMock)

	return r
}
