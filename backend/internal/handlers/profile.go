package handlers

import (
	"net/http"

	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
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
	httpx.WriteJSON(w, http.StatusOK, profile)
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.UpdateProfileRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}

	email := req.Email
	if email == "" {
		email = user.Email
	}

	profile := h.store.SaveProfile(models.UserProfile{
		UserID:      user.ID,
		Email:       email,
		Name:        req.Name,
		Description: req.Description,
		AvatarURL:   req.AvatarURL,
	})
	httpx.WriteJSON(w, http.StatusOK, profile)
}

func defaultProfile(user auth.User) models.UserProfile {
	return models.UserProfile{
		UserID:    user.ID,
		Email:     user.Email,
		Name:      user.Name,
		AvatarURL: user.AvatarURL,
	}
}
