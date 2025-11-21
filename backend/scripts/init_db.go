package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// 1. Connect to default 'postgres' database to create the new database
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/postgres?sslmode=disable", user, password, host, port)
	conn, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())

	// Check if database exists
	var exists bool
	err = conn.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)", dbName).Scan(&exists)
	if err != nil {
		log.Fatalf("Failed to check if database exists: %v\n", err)
	}

	if !exists {
		fmt.Printf("Creating database %s...\n", dbName)
		_, err = conn.Exec(context.Background(), fmt.Sprintf("CREATE DATABASE %s", dbName))
		if err != nil {
			log.Fatalf("Failed to create database: %v\n", err)
		}
		fmt.Println("Database created successfully.")
	} else {
		fmt.Println("Database already exists.")
	}

	conn.Close(context.Background())

	// 2. Connect to the new database to run schema
	dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbName)
	conn, err = pgx.Connect(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Unable to connect to new database: %v\n", err)
	}
	defer conn.Close(context.Background())

	// Read schema file
	schema, err := os.ReadFile("sql/schema/001_init.sql")
	if err != nil {
		log.Fatalf("Failed to read schema file: %v\n", err)
	}

	// Execute schema
	// Split by ; to execute multiple statements if needed, but pgx might handle it.
	// pgx.Exec can handle multiple statements.
	fmt.Println("Running schema migration...")
	_, err = conn.Exec(context.Background(), string(schema))
	if err != nil {
		// Ignore "relation already exists" errors if re-running
		if !strings.Contains(err.Error(), "already exists") {
			log.Fatalf("Failed to execute schema: %v\n", err)
		} else {
			fmt.Println("Schema already applied (or partial error):", err)
		}
	} else {
		fmt.Println("Schema applied successfully.")
	}
}
