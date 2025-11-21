package config

import "os"

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type Config struct {
	ManagementPort string
	ServingPort    string
	Database       DatabaseConfig
}

func NewConfig() *Config {
	mgmtPort := os.Getenv("MANAGEMENT_PORT")
	if mgmtPort == "" {
		mgmtPort = "8080"
	}
	servingPort := os.Getenv("SERVING_PORT")
	if servingPort == "" {
		servingPort = "8000"
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
		ManagementPort: mgmtPort,
		ServingPort:    servingPort,
		Database: DatabaseConfig{
			Host:     dbHost,
			Port:     dbPort,
			User:     dbUser,
			Password: dbPassword,
			DBName:   dbName,
		},
	}
}
