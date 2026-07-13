package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) ListCampaignChatMessages(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	chat, found := h.store.GetCampaignChat(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "chat not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.enrichCampaignChatMessages(campaignID, h.store.ListChatMessages(chat.ID)))
}

func (h *Handler) CreateCampaignChatMessage(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	chat, found := h.store.GetCampaignChat(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "chat not found")
		return
	}

	var req models.CreateChatMessageRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Text == "" {
		httpx.WriteError(w, http.StatusBadRequest, "text is required")
		return
	}

	msg := h.store.CreateChatMessage(models.ChatMessage{
		ChatID:     chat.ID,
		AuthorID:   user.ID,
		AuthorName: h.campaignChatAuthorName(campaignID, user.ID),
		Text:       req.Text,
	})
	httpx.WriteJSON(w, http.StatusCreated, msg)
}

func (h *Handler) UpdateCampaignChatMessage(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	chat, found := h.store.GetCampaignChat(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "chat not found")
		return
	}

	messageID := chi.URLParam(r, "messageID")
	msg, found := h.store.GetChatMessage(messageID)
	if !found || msg.ChatID != chat.ID {
		httpx.WriteError(w, http.StatusNotFound, "message not found")
		return
	}
	if msg.AuthorID != user.ID {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	var req models.UpdateChatMessageRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Text == "" {
		httpx.WriteError(w, http.StatusBadRequest, "text is required")
		return
	}

	updated, ok := h.store.UpdateChatMessage(messageID, req.Text)
	if !ok {
		httpx.WriteError(w, http.StatusNotFound, "message not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, updated)
}

func (h *Handler) DeleteCampaignChatMessage(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	chat, found := h.store.GetCampaignChat(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "chat not found")
		return
	}

	messageID := chi.URLParam(r, "messageID")
	msg, found := h.store.GetChatMessage(messageID)
	if !found || msg.ChatID != chat.ID {
		httpx.WriteError(w, http.StatusNotFound, "message not found")
		return
	}
	if msg.AuthorID != user.ID {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	if !h.store.DeleteChatMessage(messageID) {
		httpx.WriteError(w, http.StatusNotFound, "message not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListGeneralChatMessages(w http.ResponseWriter, r *http.Request) {
	_, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	chat, found := h.store.GetGeneralChat()
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "chat not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.store.ListChatMessages(chat.ID))
}

func (h *Handler) CreateGeneralChatMessage(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	chat, found := h.store.GetGeneralChat()
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "chat not found")
		return
	}

	var req models.CreateChatMessageRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Text == "" {
		httpx.WriteError(w, http.StatusBadRequest, "text is required")
		return
	}

	msg := h.store.CreateChatMessage(models.ChatMessage{
		ChatID:     chat.ID,
		AuthorID:   user.ID,
		AuthorName: authorName(h, user),
		Text:       req.Text,
	})
	httpx.WriteJSON(w, http.StatusCreated, msg)
}

func authorName(h *Handler, user auth.User) string {
	if profile, found := h.store.GetProfile(user.ID); found && profile.Name != "" {
		return profile.Name
	}
	return user.Email
}

func (h *Handler) campaignChatAuthorName(campaignID, userID string) string {
	if campaign, found := h.store.GetCampaign(campaignID); found && campaign.MasterID == userID {
		return "Мастер"
	}

	for _, character := range h.store.ListCharactersByCampaign(campaignID) {
		if character.OwnerID == userID && character.Name != "" {
			return character.Name
		}
	}

	if profile, found := h.store.GetProfile(userID); found {
		if profile.Name != "" {
			return profile.Name
		}
		if profile.Email != "" {
			return profile.Email
		}
	}

	return "Игрок"
}

func (h *Handler) enrichCampaignChatMessages(campaignID string, messages []models.ChatMessage) []models.ChatMessage {
	for i := range messages {
		messages[i].AuthorName = h.campaignChatAuthorName(campaignID, messages[i].AuthorID)
	}
	return messages
}
