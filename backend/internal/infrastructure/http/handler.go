package http

import (
	"net/http"
	"strings"

	"mock-api-backend/internal/usecase"

	"github.com/gin-gonic/gin"
)

type MockHandler struct {
	service *usecase.MockService
}

func NewMockHandler(service *usecase.MockService) *MockHandler {
	return &MockHandler{service: service}
}

func (h *MockHandler) CreateMock(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Path         string `json:"path" binding:"required"`
		Method       string `json:"method" binding:"required"`
		Status       int    `json:"status" binding:"required"`
		ResponseBody string `json:"response_body" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mock, err := h.service.CreateMock(userID, req.Path, req.Method, req.ResponseBody, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, mock)
}

func (h *MockHandler) ListMocks(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	mocks, err := h.service.GetMocks(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mocks)
}

func (h *MockHandler) ServeMock(c *gin.Context) {
	userID := c.GetString("userID") // In real scenario, this might be different logic for public access
	// For now, let's assume the creator is testing it, or we need a way to identify the 'owner' of the mock path
	// Since the requirement says "each user will manage there own mock API", serving it might require identifying the user context.
	// However, usually mocks are public.
	// If anonymous users create mocks, how do others access them?
	// Maybe the path should include the user ID or a unique slug?
	// Or we assume the user testing it is the same user (cookie based).
	// Let's stick to the cookie based for now as per "User need login if want create API persistent. But only implement anonoymous create api for now".

	// If we want to allow public access, we might need to change the path strategy.
	// But for "fast test" with curl, the curl command won't have the cookie.
	// This is a gap in the "anonymous user" requirement vs "curl test".
	// If I use curl, I don't have the cookie, so I am a different "anonymous user".
	// So I can't see the mock created by the browser user.

	// To solve this for MVP:
	// 1. The path could be global (collision risk).
	// 2. The path includes a unique token.
	// 3. We just implement the management part for now as requested "backend will writen in Golang... Will test at next phase".

	// Let's implement the ServeMock logic assuming the user context is present or we look up by path globally (if we change repo).
	// Given the repo `GetByPathAndMethod` takes `userID`, it implies mocks are scoped to users.
	// Let's assume for now we only test via browser where cookie is present.

	path := c.Param("path")
	method := c.Request.Method

	// We need to handle the wildcard param from Gin correctly
	// If route is /api/:path, path will be the segment.
	// If we use *path, it captures everything.
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	mock, err := h.service.GetMockForServing(userID, path, method)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if mock == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mock not found"})
		return
	}

	c.Header("Content-Type", "application/json")
	c.String(mock.Status, mock.ResponseBody)
}
