package handlers

import (
	"net/http"

	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
)

func (h *Handler) Health(w http.ResponseWriter, _ *http.Request) {
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	profile, found := h.store.GetProfile(user.ID)
	if !found {
		ensured, err := h.store.EnsureProfile(defaultProfile(user))
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "failed to load profile")
			return
		}
		profile = ensured
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]any{
		"id":      user.ID,
		"email":   user.Email,
		"profile": profile,
	})
}
