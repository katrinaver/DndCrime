package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"database/sql"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/config"
	"github.com/kate/dndcrime/internal/handlers"
	"github.com/kate/dndcrime/internal/storage"
	"github.com/kate/dndcrime/internal/store"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	if cfg.DevAuthEnabled {
		log.Println("INFO: DEV_AUTH_ENABLED=true — accepting dev-stub-token as user-demo")
	} else if cfg.AppJWTSecret == "" {
		log.Println("WARNING: APP_JWT_SECRET is not set — protected routes will reject all tokens")
	}

	st, cleanup := initStore(cfg)
	defer cleanup()

	authService := auth.NewService(cfg.GoogleClientID, cfg.AppJWTSecret)
	uploader := storage.NewCompositeUploader(storage.NewS3Client(storage.S3Config{
		AccessKey:  cfg.S3AccessKey,
		SecretKey:  cfg.S3SecretKey,
		Endpoint:   cfg.S3Endpoint,
		Bucket:     cfg.S3Bucket,
		PublicBase: cfg.S3PublicBase,
	}), ".uploads")
	if uploader.UsesLocal() {
		log.Println("INFO: local file uploads enabled (.uploads/)")
	} else {
		log.Println("INFO: S3 uploads enabled")
	}

	h := handlers.New(st, authService, uploader)

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
	r.Get("/api/uploads/files/*", h.ServeUploadedFile)
	r.Post("/api/auth/google", h.GoogleLogin)

	r.Route("/api", func(r chi.Router) {
		r.Use(auth.Middleware(auth.MiddlewareOptions{
			JWTSecret:      cfg.AppJWTSecret,
			DevAuthEnabled: cfg.DevAuthEnabled,
		}))

		r.Get("/me", h.Me)
		r.Post("/uploads", h.UploadFile)

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
				r.Put("/", h.UpdateCampaign)
				r.Delete("/", h.DeleteCampaign)
				r.Get("/questionnaire", h.GetCampaignQuestionnaire)
				r.Put("/questionnaire", h.UpdateCampaignQuestionnaire)
				r.Get("/party", h.ListCampaignParty)
				r.Get("/assets", h.ListCampaignAssets)
				r.Post("/assets", h.CreateCampaignAsset)
				r.Put("/assets/{assetID}", h.UpdateCampaignAsset)
				r.Delete("/assets/{assetID}", h.DeleteCampaignAsset)
				r.Get("/progress", h.GetCampaignProgress)
				r.Put("/progress", h.SaveCampaignProgress)
				r.Post("/progress/notes", h.CreateCampaignProgressNote)
				r.Delete("/progress/notes/{noteID}", h.DeleteCampaignProgressNote)
				r.Post("/invitation", h.PublishCampaignInvitation)
				r.Get("/invite-link", h.GetCampaignInviteLink)
				r.Post("/invite-link/reset", h.ResetCampaignInviteLink)
				r.Post("/join", h.JoinCampaign)
				r.Post("/leave", h.LeaveCampaign)
				r.Route("/chat", func(r chi.Router) {
					r.Get("/messages", h.ListCampaignChatMessages)
					r.Post("/messages", h.CreateCampaignChatMessage)
					r.Put("/messages/{messageID}", h.UpdateCampaignChatMessage)
					r.Delete("/messages/{messageID}", h.DeleteCampaignChatMessage)
				})
			})
		})

		r.Route("/invites", func(r chi.Router) {
			r.Get("/{token}", h.GetInvitePreview)
			r.Post("/{token}/join", h.JoinByInvite)
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

func initStore(cfg config.Config) (store.Store, func()) {
	if cfg.MySQLDSN == "" {
		log.Println("INFO: MYSQL_DSN is not set — using in-memory store")
		return store.NewMemory(), func() {}
	}

	dsn, err := prepareMySQLDSN(cfg)
	if err != nil {
		log.Fatalf("prepare mysql dsn: %v", err)
	}

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("open mysql: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		log.Fatalf("ping mysql: %v", err)
	}
	if err := store.EnsureMySQLSchema(ctx, db); err != nil {
		_ = db.Close()
		log.Fatalf("ensure mysql schema: %v", err)
	}

	log.Println("INFO: using MySQL store")
	return store.NewMySQL(db), func() {
		_ = db.Close()
	}
}

func prepareMySQLDSN(cfg config.Config) (string, error) {
	if cfg.MySQLCACert == "" {
		return cfg.MySQLDSN, nil
	}

	dsnCfg, err := mysql.ParseDSN(cfg.MySQLDSN)
	if err != nil {
		return "", err
	}

	cert, err := os.ReadFile(cfg.MySQLCACert)
	if err != nil {
		return "", err
	}

	roots := x509.NewCertPool()
	if !roots.AppendCertsFromPEM(cert) {
		return "", fmt.Errorf("mysql ca cert does not contain PEM certificates")
	}

	host, _, err := net.SplitHostPort(dsnCfg.Addr)
	if err != nil {
		host = dsnCfg.Addr
	}

	tlsName := "dndcrime-mysql"
	if err := mysql.RegisterTLSConfig(tlsName, &tls.Config{
		RootCAs:    roots,
		MinVersion: tls.VersionTLS12,
		ServerName: host,
	}); err != nil {
		return "", err
	}

	dsnCfg.TLSConfig = tlsName
	return dsnCfg.FormatDSN(), nil
}
