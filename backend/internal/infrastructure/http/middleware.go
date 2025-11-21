package http

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const UserIDCookie = "user_id"

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := c.Cookie(UserIDCookie)
		if err != nil || userID == "" {
			userID = uuid.New().String()
			// Set cookie for 1 year (or session)
			// For anonymous, maybe shorter? But requirement says API lives 10 mins. User identity can live longer.
			c.SetCookie(UserIDCookie, userID, 3600*24, "/", "", false, true)
		}
		c.Set(UserIDCookie, userID) // Store in context for handlers
		c.Set("userID", userID)     // easier key
		c.Next()
	}
}

func SubdomainAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		host := c.Request.Host
		// Host is likely "subdomain.localhost:8000" or "subdomain.domain.com"
		// We need to extract the first part.
		// Simple split by "."
		// Note: This is a naive implementation. For production, use a robust domain parser.
		// Also handle "localhost:8000" (no subdomain) -> maybe public or error?

		var userID string
		// Check if it's localhost (dev)
		// If host is "user1.localhost:8000", we want "user1".
		// If host is "localhost:8000", we have no user.

		// Split by port first if present
		// net.SplitHostPort might be safer but let's do simple string manip for now or assume standard format.

		// Let's try to find the first dot.
		// If no dot, or dot is after the last colon (port), then no subdomain?
		// Actually, "localhost" has no dot.

		// Let's assume the format is always `userID.domain:port` or `userID.domain`.

		// For this specific requirement: "user1.localhost:8000"

		hostParts := strings.Split(host, ".")
		if len(hostParts) > 1 {
			userID = hostParts[0]
		}

		if userID == "" || userID == "localhost" {
			// Fallback or error?
			// Requirement: "each user will have the own random token... user1.localhost:8000"
			// If accessed via localhost:8000 directly, maybe return 404 or 400.
			// But let's allow it to proceed with empty userID, handler will decide.
		}

		if userID != "" && userID != "localhost" {
			c.Set("userID", userID)
		}

		c.Next()
	}
}
