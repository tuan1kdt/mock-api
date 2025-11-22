package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"mock-api-backend/internal/usecase"
)

type MockHandler struct {
	service          *usecase.MockService
	scheme           string
	managementDomain string
}

func NewMockHandler(service *usecase.MockService, scheme, managementDomain string) *MockHandler {
	return &MockHandler{
		service:          service,
		scheme:           scheme,
		managementDomain: managementDomain,
	}
}

func (h *MockHandler) CreateMock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Path         string `json:"path"`
		Method       string `json:"method"`
		Status       int    `json:"status"`
		ResponseBody string `json:"response_body"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Path == "" || req.Method == "" || req.Status == 0 || req.ResponseBody == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	mock, err := h.service.CreateMock(userID, req.Path, req.Method, req.ResponseBody, req.Status)
	if err != nil {
		if err.Error() == "mock endpoint already exists" {
			http.Error(w, "Endpoint already exists", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(mock)
}

func (h *MockHandler) UpdateMock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/mocks/")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	var req struct {
		Path         string `json:"path"`
		Method       string `json:"method"`
		Status       int    `json:"status"`
		ResponseBody string `json:"response_body"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Path == "" || req.Method == "" || req.Status == 0 || req.ResponseBody == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	mock, err := h.service.UpdateMock(userID, id, req.Path, req.Method, req.ResponseBody, req.Status)
	if err != nil {
		if err.Error() == "mock endpoint already exists" {
			http.Error(w, "Endpoint already exists", http.StatusConflict)
			return
		}
		if err.Error() == "mock endpoint not found" {
			http.Error(w, "Mock not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mock)
}

func (h *MockHandler) ListMocks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	mocks, err := h.service.GetMocks(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create response with curl commands
	type MockResponse struct {
		ID           string `json:"id"`
		UserID       string `json:"user_id"`
		Path         string `json:"path"`
		Method       string `json:"method"`
		Status       int    `json:"status"`
		ResponseBody string `json:"response_body"`
		CreatedAt    string `json:"created_at"`
		ExpiresAt    string `json:"expires_at"`
		HitCount     int    `json:"hit_count"`
		CurlCommand  string `json:"curl_command"`
	}

	responses := make([]MockResponse, len(mocks))
	for i, mock := range mocks {
		url := fmt.Sprintf("%s://%s.%s%s", h.scheme, userID, h.managementDomain, mock.Path)
		curlCommand := fmt.Sprintf(`curl -X %s "%s"`, mock.Method, url)

		responses[i] = MockResponse{
			ID:           mock.ID,
			UserID:       mock.UserID,
			Path:         mock.Path,
			Method:       mock.Method,
			Status:       mock.Status,
			ResponseBody: mock.ResponseBody,
			CreatedAt:    mock.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			ExpiresAt:    mock.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
			HitCount:     mock.HitCount,
			CurlCommand:  curlCommand,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

func (h *MockHandler) DeleteMock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/mocks/")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	err := h.service.DeleteMock(userID, id)
	if err != nil {
		if err.Error() == "mock endpoint not found" {
			http.Error(w, "Mock not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Mock deleted successfully"})
}

func (h *MockHandler) ServeMock(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromSubdomain(r)

	path := r.URL.Path
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	method := r.Method

	mock, err := h.service.GetMockForServing(userID, path, method)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if mock == nil {
		http.Error(w, "Mock not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(mock.Status)
	w.Write([]byte(mock.ResponseBody))
}
