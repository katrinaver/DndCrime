package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/kate/dndcrime/internal/auth"
)

type Handler struct{}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) Health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"email":   claims.Email,
		"message": "Authenticated via Supabase JWT",
	})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
