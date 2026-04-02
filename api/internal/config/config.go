package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port                 string
	SupabaseURL          string
	SupabasePublishableKey string
}

func Load() (Config, error) {
	cfg := Config{
		Port:                  getenv("PORT", "8080"),
		SupabaseURL:           os.Getenv("SUPABASE_URL"),
		SupabasePublishableKey: os.Getenv("SUPABASE_PUBLISHABLE_KEY"),
	}

	if cfg.SupabaseURL == "" || cfg.SupabasePublishableKey == "" {
		return Config{}, fmt.Errorf("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required")
	}

	return cfg, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
