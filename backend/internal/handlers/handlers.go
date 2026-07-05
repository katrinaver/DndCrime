package handlers

import (
	"github.com/kate/dndcrime/internal/store"
)

type Handler struct {
	store store.Store
}

func New(s store.Store) *Handler {
	return &Handler{store: s}
}
