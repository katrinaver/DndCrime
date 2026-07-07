package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	AppJWTSecret   string
	GoogleClientID string
	MySQLDSN       string
	MySQLCACert    string
	S3AccessKey    string
	S3SecretKey    string
	S3Endpoint     string
	S3Bucket       string
	S3PublicBase   string
	AllowedOrigins []string
	DevAuthEnabled bool
}

func Load() Config {
	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:5173"
	}

	return Config{
		Port:           envOrDefault("PORT", "8080"),
		AppJWTSecret:   os.Getenv("APP_JWT_SECRET"),
		GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
		MySQLDSN:       os.Getenv("MYSQL_DSN"),
		MySQLCACert:    os.Getenv("MYSQL_CA_CERT"),
		S3AccessKey:    os.Getenv("S3_ACCESS_KEY"),
		S3SecretKey:    os.Getenv("S3_SECRET_KEY"),
		S3Endpoint:     strings.TrimRight(os.Getenv("S3_ENDPOINT"), "/"),
		S3Bucket:       os.Getenv("S3_BUCKET"),
		S3PublicBase:   strings.TrimRight(os.Getenv("S3_PUBLIC_BASE_URL"), "/"),
		AllowedOrigins: strings.Split(origins, ","),
		DevAuthEnabled: os.Getenv("DEV_AUTH_ENABLED") == "true",
	}
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
