package main

import (
	"log"
	"net/http"
	"os"

	"github.com/sam/kanban-task-board/api/internal/config"
	httpapi "github.com/sam/kanban-task-board/api/internal/http"
	"github.com/sam/kanban-task-board/api/internal/supabase"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	client := supabase.NewClient(cfg.SupabaseURL, cfg.SupabasePublishableKey)
	handler := httpapi.NewHandler(client)

	mux := http.NewServeMux()
	handler.Register(mux)

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: withCORS(mux),
	}

	log.Printf("api listening on :%s", cfg.Port)
	log.Fatal(server.ListenAndServe())
}

func withCORS(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("FRONTEND_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
