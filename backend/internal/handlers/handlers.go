package handlers

import (
	"context"

	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/store"
)

type Uploader interface {
	Configured() bool
	Upload(ctx context.Context, objectKey, contentType string, body []byte) (string, error)
}

type Handler struct {
	store    store.Store
	auth     auth.Service
	uploader Uploader
}

func New(s store.Store, authService auth.Service, uploader Uploader) *Handler {
	return &Handler{store: s, auth: authService, uploader: uploader}
}
