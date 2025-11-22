package http

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
)

const UserIDCookie = "user_id"
const userIDKey = "userID"

func getUserID(r *http.Request) string {
	// Try to get from context first (set by middleware)
	if userID := r.Context().Value(userIDKey); userID != nil {
		if id, ok := userID.(string); ok {
			return id
		}
	}

	// Try to get from cookie
	cookie, err := r.Cookie(UserIDCookie)
	if err == nil && cookie.Value != "" {
		return cookie.Value
	}

	// Generate new user ID (cookie will be set by middleware)
	return generateID()
}

func getUserIDFromSubdomain(r *http.Request) string {
	host := r.Host
	hostParts := strings.Split(host, ".")
	if len(hostParts) > 1 {
		userID := hostParts[0]
		if userID != "" && userID != "localhost" {
			return userID
		}
	}
	return getUserID(r)
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to get from cookie first
		cookie, err := r.Cookie(UserIDCookie)
		var userID string
		if err == nil && cookie.Value != "" {
			userID = cookie.Value
		} else {
			// Generate new user ID
			userID = generateID()
			// Set cookie
			http.SetCookie(w, &http.Cookie{
				Name:     UserIDCookie,
				Value:    userID,
				Path:     "/",
				MaxAge:   0,
				HttpOnly: true,
				SameSite: http.SameSiteLaxMode,
			})
		}
		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
