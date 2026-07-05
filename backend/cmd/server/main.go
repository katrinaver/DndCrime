package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/config"
	"github.com/kate/dndcrime/internal/handlers"
)

func main() {
	cfg := config.Load()

	if cfg.SupabaseJWTSecret == "" {
		log.Println("WARNING: SUPABASE_JWT_SECRET is not set — protected routes will reject all tokens")
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	h := handlers.New()

	r.Get("/api/health", h.Health)

	r.Route("/api", func(r chi.Router) {
		r.Use(auth.Middleware(cfg.SupabaseJWTSecret))
		r.Get("/me", h.Me)
	})

	addr := ":" + cfg.Port
	log.Printf("Server listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
