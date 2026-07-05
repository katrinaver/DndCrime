package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) ListCampaigns(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.store.ListCampaignsForUser(user.ID))
}

func (h *Handler) GetCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMember(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	campaign, found := h.store.GetCampaign(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, campaign)
}

func (h *Handler) CreateCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateCampaignRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Name == "" {
		httpx.WriteError(w, http.StatusBadRequest, "name is required")
		return
	}

	masterName := user.Email
	if profile, found := h.store.GetProfile(user.ID); found && profile.Name != "" {
		masterName = profile.Name
	}

	campaign := models.Campaign{
		Name:                req.Name,
		MasterID:            user.ID,
		MasterName:          masterName,
		PlayerIDs:           []string{user.ID},
		Place:               req.Place,
		Setting:             req.Setting,
		MaxPlayers:          req.MaxPlayers,
		Level:               req.Level,
		ExtraParams:         req.ExtraParams,
		AntiAchievementPool: req.AntiAchievementPool,
		SessionDate:         req.SessionDate,
		SessionTime:         req.SessionTime,
		Status:              models.CampaignActive,
	}

	questionnaire := models.CharacterQuestionnaire{
		Title:       "Анкета: " + req.Name,
		Description: req.Setting,
		Fields:      buildQuestionnaireFields(req.Questionnaire),
	}

	created := h.store.CreateCampaign(campaign, questionnaire)

	if req.SessionDate != "" {
		h.store.CreateCalendarEvent(models.CalendarEvent{
			Date:       req.SessionDate,
			Time:       req.SessionTime,
			Title:      "Сессия: " + created.Name,
			CampaignID: created.ID,
			Campaign:   created.Name,
			Place:      req.Place,
			CreatedBy:  user.ID,
		})
	}

	httpx.WriteJSON(w, http.StatusCreated, created)
}

func (h *Handler) GetCampaignQuestionnaire(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMember(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	q, found := h.store.GetQuestionnaire(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "questionnaire not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, q)
}

func (h *Handler) UpdateCampaignQuestionnaire(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	campaign, found := h.store.GetCampaign(campaignID)
	if !found || campaign.MasterID != user.ID {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	var q models.CharacterQuestionnaire
	if err := httpx.DecodeJSON(r, &q); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	q.CampaignID = campaignID
	httpx.WriteJSON(w, http.StatusOK, h.store.SaveQuestionnaire(q))
}

func (h *Handler) ListCampaignParty(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMember(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	characters := h.store.ListCharactersByCampaign(campaignID)
	summaries := make([]models.CharacterSummary, 0, len(characters))
	for _, c := range characters {
		summaries = append(summaries, c.ToSummary())
	}
	httpx.WriteJSON(w, http.StatusOK, summaries)
}

func buildQuestionnaireFields(settings []models.QuestionnaireFieldSetting) []models.QuestionnaireField {
	if len(settings) == 0 {
		return []models.QuestionnaireField{}
	}
	// Заглушка: позже резолвить из каталога полей листа D&D.
	fields := make([]models.QuestionnaireField, 0, len(settings))
	for _, s := range settings {
		if !s.Enabled {
			continue
		}
		fields = append(fields, models.QuestionnaireField{
			ID:      s.FieldID,
			Label:   s.FieldID,
			Type:    models.FieldSelect,
			Options: s.SelectedOptions,
		})
	}
	return fields
}
