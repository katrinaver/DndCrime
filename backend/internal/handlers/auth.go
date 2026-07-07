package handlers

import (
	"net/http"

	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

type googleLoginRequest struct {
	Credential string `json:"credential"`
}

type authResponse struct {
	AccessToken string             `json:"accessToken"`
	User        authUserResponse   `json:"user"`
	Profile     models.UserProfile `json:"profile"`
}

type authUserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}

func (h *Handler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var req googleLoginRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}

	user, token, err := h.auth.AuthenticateGoogle(r.Context(), req.Credential)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}

	profile, found := h.store.GetProfile(user.ID)
	if !found {
		profile = h.store.SaveProfile(defaultProfile(user))
	} else if profile.Name == "" || profile.AvatarURL == "" || profile.Email == "" {
		if profile.Email == "" {
			profile.Email = user.Email
		}
		if profile.Name == "" {
			profile.Name = user.Name
		}
		if profile.AvatarURL == "" {
			profile.AvatarURL = user.AvatarURL
		}
		profile = h.store.SaveProfile(profile)
	}

	httpx.WriteJSON(w, http.StatusOK, authResponse{
		AccessToken: token,
		User: authUserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			AvatarURL: user.AvatarURL,
		},
		Profile: profile,
	})
}
