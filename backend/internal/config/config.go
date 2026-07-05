package config

import (
	"os"
	"strings"
)

type Config struct {
	Port              string
	SupabaseJWTSecret string
	AllowedOrigins    []string
}

func Load() Config {
	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:5173"
	}

	return Config{
		Port:              envOrDefault("PORT", "8080"),
		SupabaseJWTSecret: os.Getenv("SUPABASE_JWT_SECRET"),
		AllowedOrigins:    strings.Split(origins, ","),
	}
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
