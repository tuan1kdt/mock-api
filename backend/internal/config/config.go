package config

import (
	"os"
	"strings"
)

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type Config struct {
	Port             string
	Scheme           string
	ManagementDomain string
	AllowedOrigins   []string
	Database         DatabaseConfig
}

func NewConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	scheme := os.Getenv("SCHEME")
	if scheme == "" {
		scheme = "https"
	}

	managementDomain := os.Getenv("MANAGEMENT_DOMAIN")
	if managementDomain == "" {
		managementDomain = "localhost:8787"
	}

	allowedOrigins := []string{"*"}
	if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
		allowedOrigins = splitAndTrim(envOrigins)
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "mock_api"
	}

	return &Config{
		Port:             port,
		Scheme:           scheme,
		ManagementDomain: managementDomain,
		AllowedOrigins:   allowedOrigins,
		Database: DatabaseConfig{
			Host:     dbHost,
			Port:     dbPort,
			User:     dbUser,
			Password: dbPassword,
			DBName:   dbName,
		},
	}
}

func splitAndTrim(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
