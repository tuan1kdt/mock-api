package domain

import (
	"time"
)

type MockAPI struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	Path         string    `json:"path"`
	Method       string    `json:"method"`
	Status       int       `json:"status"`
	ResponseBody string    `json:"response_body"`
	CreatedAt    time.Time `json:"created_at"`
	ExpiresAt    time.Time `json:"expires_at"`
	HitCount     int       `json:"hit_count"`
}
