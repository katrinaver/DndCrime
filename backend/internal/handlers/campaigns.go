package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
	"github.com/kate/dndcrime/internal/store"
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

func (h *Handler) UpdateCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	var req models.UpdateCampaignRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Name == "" {
		httpx.WriteError(w, http.StatusBadRequest, "name is required")
		return
	}

	updated, found := h.store.UpdateCampaign(campaignID, req)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, updated)
}

func (h *Handler) ListCampaignAssets(w http.ResponseWriter, r *http.Request) {
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

	httpx.WriteJSON(w, http.StatusOK, h.store.ListCampaignAssets(campaignID))
}

func (h *Handler) CreateCampaignAsset(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	var req models.CreateCampaignAssetRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Title == "" {
		httpx.WriteError(w, http.StatusBadRequest, "title is required")
		return
	}

	asset := models.CampaignAsset{
		Title:       req.Title,
		Type:        req.Type,
		Description: req.Description,
		URL:         req.URL,
	}
	created := h.store.CreateCampaignAsset(campaignID, asset)
	httpx.WriteJSON(w, http.StatusCreated, created)
}

func (h *Handler) UpdateCampaignAsset(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	assetID := chi.URLParam(r, "assetID")
	var req models.UpdateCampaignAssetRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Title == "" {
		httpx.WriteError(w, http.StatusBadRequest, "title is required")
		return
	}

	updated, found := h.store.UpdateCampaignAsset(campaignID, assetID, models.CampaignAsset{
		Title:       req.Title,
		Type:        req.Type,
		Description: req.Description,
		URL:         req.URL,
	})
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "asset not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, updated)
}

func (h *Handler) DeleteCampaignAsset(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	assetID := chi.URLParam(r, "assetID")
	if !h.store.DeleteCampaignAsset(campaignID, assetID) {
		httpx.WriteError(w, http.StatusNotFound, "asset not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) GetCampaignProgress(w http.ResponseWriter, r *http.Request) {
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

	progress, _ := h.store.GetCampaignProgress(campaignID)
	if progress.CampaignID == "" {
		progress.CampaignID = campaignID
	}
	httpx.WriteJSON(w, http.StatusOK, progress)
}

func (h *Handler) SaveCampaignProgress(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	var req models.SaveCampaignProgressRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}

	progress := models.CampaignProgress{
		CampaignID:     campaignID,
		Summary:        req.Summary,
		CurrentChapter: req.CurrentChapter,
		Milestones:     req.Milestones,
	}
	httpx.WriteJSON(w, http.StatusOK, h.store.SaveCampaignProgress(progress))
}

func (h *Handler) PublishCampaignInvitation(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	post, campaign, err := h.store.PublishCampaignInvitation(campaignID, user.ID, authorName(h, user))
	if err != nil {
		switch err {
		case store.ErrInvitationExists:
			httpx.WriteJSON(w, http.StatusOK, map[string]any{
				"post":     post,
				"campaign": campaign,
				"already":  true,
			})
		case store.ErrCampaignNotFound:
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		default:
			httpx.WriteError(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	httpx.WriteJSON(w, http.StatusCreated, map[string]any{
		"post":     post,
		"campaign": campaign,
	})
}

func (h *Handler) JoinCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	campaign, err := h.store.JoinCampaign(campaignID, user.ID)
	if err != nil {
		switch err {
		case store.ErrCampaignNotFound:
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		case store.ErrAlreadyMember:
			httpx.WriteJSON(w, http.StatusOK, campaign)
		case store.ErrCampaignFull:
			httpx.WriteError(w, http.StatusConflict, "campaign is full")
		case store.ErrCampaignNotActive:
			httpx.WriteError(w, http.StatusConflict, "campaign is not accepting players")
		default:
			httpx.WriteError(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	httpx.WriteJSON(w, http.StatusOK, campaign)
}

func (h *Handler) LeaveCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	err := h.store.LeaveCampaign(campaignID, user.ID)
	if err != nil {
		switch err {
		case store.ErrCampaignNotFound:
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		case store.ErrCannotLeaveAsMaster:
			httpx.WriteError(w, http.StatusConflict, "master cannot leave campaign")
		case store.ErrNotCampaignMember:
			httpx.WriteError(w, http.StatusConflict, "not a campaign member")
		default:
			httpx.WriteError(w, http.StatusBadRequest, err.Error())
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) DeleteCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	if !h.store.IsCampaignMaster(campaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	if err := h.store.DeleteCampaign(campaignID, user.ID); err != nil {
		if err == store.ErrCampaignNotFound {
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
			return
		}
		httpx.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
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
