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
	"github.com/kate/dndcrime/internal/store"
)

func main() {
	cfg := config.Load()

	if cfg.DevAuthEnabled {
		log.Println("INFO: DEV_AUTH_ENABLED=true — accepting dev-stub-token as user-demo")
	} else if cfg.SupabaseJWTSecret == "" {
		log.Println("WARNING: SUPABASE_JWT_SECRET is not set — protected routes will reject all tokens")
	}

	st := store.NewMemory()
	h := handlers.New(st)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/api/health", h.Health)

	r.Route("/api", func(r chi.Router) {
		r.Use(auth.Middleware(auth.MiddlewareOptions{
			JWTSecret:      cfg.SupabaseJWTSecret,
			DevAuthEnabled: cfg.DevAuthEnabled,
		}))

		r.Get("/me", h.Me)

		r.Route("/profile", func(r chi.Router) {
			r.Get("/", h.GetProfile)
			r.Put("/", h.UpdateProfile)
		})

		r.Route("/notes", func(r chi.Router) {
			r.Get("/", h.GetNote)
			r.Put("/", h.UpdateNote)
		})

		r.Route("/campaigns", func(r chi.Router) {
			r.Get("/", h.ListCampaigns)
			r.Post("/", h.CreateCampaign)
			r.Route("/{campaignID}", func(r chi.Router) {
				r.Get("/", h.GetCampaign)
				r.Get("/questionnaire", h.GetCampaignQuestionnaire)
				r.Put("/questionnaire", h.UpdateCampaignQuestionnaire)
				r.Get("/party", h.ListCampaignParty)
				r.Route("/chat", func(r chi.Router) {
					r.Get("/messages", h.ListCampaignChatMessages)
					r.Post("/messages", h.CreateCampaignChatMessage)
				})
			})
		})

		r.Route("/characters", func(r chi.Router) {
			r.Get("/", h.ListCharacters)
			r.Post("/", h.CreateCharacter)
			r.Route("/{characterID}", func(r chi.Router) {
				r.Get("/", h.GetCharacter)
				r.Put("/", h.UpdateCharacter)
				r.Delete("/", h.DeleteCharacter)
				r.Post("/achievements", h.AssignCharacterAchievement)
			})
		})

		r.Route("/chat", func(r chi.Router) {
			r.Get("/general/messages", h.ListGeneralChatMessages)
			r.Post("/general/messages", h.CreateGeneralChatMessage)
		})

		r.Route("/news", func(r chi.Router) {
			r.Get("/posts", h.ListNewsPosts)
			r.Post("/posts", h.CreateNewsPost)
			r.Post("/posts/{postID}/comments", h.AddNewsComment)
		})

		r.Route("/calendar", func(r chi.Router) {
			r.Get("/events", h.ListCalendarEvents)
			r.Post("/events", h.CreateCalendarEvent)
		})

		r.Route("/notifications", func(r chi.Router) {
			r.Get("/", h.ListNotifications)
			r.Post("/read-all", h.MarkAllNotificationsRead)
			r.Patch("/{notificationID}/read", h.MarkNotificationRead)
		})
	})

	addr := ":" + cfg.Port
	log.Printf("Server listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
