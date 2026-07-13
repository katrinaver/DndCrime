package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) ListCharacters(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	characters := h.store.ListCharactersByOwner(user.ID)
	items := make([]models.CharacterListItem, 0, len(characters))
	for _, c := range characters {
		items = append(items, c.ToListItem())
	}
	httpx.WriteJSON(w, http.StatusOK, items)
}

func (h *Handler) GetCharacter(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	characterID := chi.URLParam(r, "characterID")
	character, found := h.store.GetCharacter(characterID)
	if !found || character.OwnerID != user.ID {
		httpx.WriteError(w, http.StatusNotFound, "character not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, character)
}

func (h *Handler) CreateCharacter(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var character models.Character
	if err := httpx.DecodeJSON(r, &character); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if character.Name == "" {
		httpx.WriteError(w, http.StatusBadRequest, "name is required")
		return
	}

	character.OwnerID = user.ID
	if character.CampaignID != "" {
		isMember, err := h.store.IsCampaignMember(character.CampaignID, user.ID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "internal error")
			return
		}
		if !isMember {
			httpx.WriteError(w, http.StatusForbidden, "not a campaign member")
			return
		}
	}
	if campaign, found := h.store.GetCampaign(character.CampaignID); found {
		character.CampaignName = campaign.Name
	}

	created := h.store.CreateCharacter(character)
	httpx.WriteJSON(w, http.StatusCreated, created)
}

func (h *Handler) UpdateCharacter(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	characterID := chi.URLParam(r, "characterID")
	var character models.Character
	if err := httpx.DecodeJSON(r, &character); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	character.ID = characterID
	character.OwnerID = user.ID

	updated, ok := h.store.UpdateCharacter(character)
	if !ok {
		httpx.WriteError(w, http.StatusNotFound, "character not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, updated)
}

func (h *Handler) DeleteCharacter(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	characterID := chi.URLParam(r, "characterID")
	if !h.store.DeleteCharacter(characterID, user.ID) {
		httpx.WriteError(w, http.StatusNotFound, "character not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) AssignCharacterAchievement(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	characterID := chi.URLParam(r, "characterID")
	var req models.AssignAchievementRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Title == "" {
		httpx.WriteError(w, http.StatusBadRequest, "title is required")
		return
	}

	character, found := h.store.GetCharacter(characterID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "character not found")
		return
	}

	// Мастер кампании или владелец персонажа может присвоить ачивку.
	if character.OwnerID != user.ID {
		if character.CampaignID == "" {
			httpx.WriteError(w, http.StatusForbidden, "forbidden")
			return
		}
		campaign, ok := h.store.GetCampaign(character.CampaignID)
		if !ok || campaign.MasterID != user.ID {
			httpx.WriteError(w, http.StatusForbidden, "forbidden")
			return
		}
	}

	updated, ok := h.store.AddCharacterAchievement(characterID, character.OwnerID, models.AntiAchievement{Title: req.Title})
	if !ok {
		httpx.WriteError(w, http.StatusNotFound, "character not found")
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, updated)
}
