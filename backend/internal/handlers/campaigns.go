package handlers

import (
	"net/http"
	"strings"

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
	httpx.WriteJSON(w, http.StatusOK, h.enrichCampaigns(h.store.ListCampaignsForUser(user.ID)))
}

func (h *Handler) GetCampaign(w http.ResponseWriter, r *http.Request) {
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

	campaign, found := h.store.GetCampaign(campaignID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.enrichCampaign(campaign))
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

	fields := req.QuestionnaireFields
	if len(fields) == 0 {
		fields = buildQuestionnaireFields(req.Questionnaire)
	}

	questionnaire := models.CharacterQuestionnaire{
		Title:       "Анкета: " + req.Name,
		Description: req.Setting,
		Fields:      fields,
	}

	created, err := h.store.CreateCampaign(campaign, questionnaire)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to create campaign")
		return
	}

	if req.SessionDate != "" {
		if _, err := h.store.CreateCalendarEvent(models.CalendarEvent{
			Date:       req.SessionDate,
			Time:       req.SessionTime,
			Title:      "Сессия: " + created.Name,
			CampaignID: created.ID,
			Campaign:   created.Name,
			Place:      req.Place,
			CreatedBy:  user.ID,
		}); err != nil {
			// best-effort: кампания уже создана, событие календаря вторично
			_ = err
		}
	}

	httpx.WriteJSON(w, http.StatusCreated, h.enrichCampaign(created))
}

func (h *Handler) UpdateCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
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
	httpx.WriteJSON(w, http.StatusOK, h.enrichCampaign(updated))
}

func (h *Handler) ListCampaignAssets(w http.ResponseWriter, r *http.Request) {
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

	httpx.WriteJSON(w, http.StatusOK, h.store.ListCampaignAssets(campaignID))
}

func (h *Handler) CreateCampaignAsset(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
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
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
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
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
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
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	progress, _, err := h.store.GetCampaignProgress(campaignID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to load progress")
		return
	}
	if progress.CampaignID == "" {
		progress.CampaignID = campaignID
	}
	if progress.Notes == nil {
		progress.Notes = []models.CampaignProgressNote{}
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
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
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
		CurrentChapter: req.CurrentChapter,
	}
	saved, err := h.store.SaveCampaignProgress(progress)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to save progress")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, saved)
}

func (h *Handler) CreateCampaignProgressNote(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	var req models.CreateCampaignProgressNoteRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(req.Content) == "" {
		httpx.WriteError(w, http.StatusBadRequest, "content is required")
		return
	}

	note := models.CampaignProgressNote{
		Content:    req.Content,
		AuthorID:   user.ID,
		AuthorName: authorName(h, user),
	}
	progress, err := h.store.CreateCampaignProgressNote(campaignID, note)
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, progress)
}

func (h *Handler) DeleteCampaignProgressNote(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	noteID := chi.URLParam(r, "noteID")
	_, err = h.store.DeleteCampaignProgressNote(campaignID, noteID)
	if err != nil {
		if err == store.ErrCampaignNotFound {
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
			return
		}
		httpx.WriteError(w, http.StatusNotFound, "note not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) PublishCampaignInvitation(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	post, campaign, err := h.store.PublishCampaignInvitation(campaignID, user.ID, authorName(h, user))
	if err != nil {
		switch err {
		case store.ErrInvitationExists:
			httpx.WriteJSON(w, http.StatusOK, map[string]any{
				"post":     post,
				"campaign": h.enrichCampaign(campaign),
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
		"campaign": h.enrichCampaign(campaign),
	})
}

// GetInvitePreview отдаёт превью кампании по токену инвайт-ссылки.
// В отличие от GetCampaign доступен не только участникам: ссылку-приглашение
// открывают ещё не присоединившиеся игроки.
func (h *Handler) GetInvitePreview(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	token := chi.URLParam(r, "token")
	campaign, found := h.store.GetCampaignByInviteToken(token)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "invite not found")
		return
	}

	isMember, err := h.store.IsCampaignMember(campaign.ID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}

	enriched := h.enrichCampaign(campaign)
	httpx.WriteJSON(w, http.StatusOK, models.CampaignInvitePreview{
		CampaignID: campaign.ID,
		Name:       campaign.Name,
		Master:     *enriched.MasterProfile,
		Setting:    campaign.Setting,
		Level:      campaign.Level,
		Players:    campaign.Players,
		MaxPlayers: campaign.MaxPlayers,
		Status:     campaign.Status,
		IsMember:   isMember,
	})
}

// JoinByInvite присоединяет пользователя к кампании по токену инвайт-ссылки.
func (h *Handler) JoinByInvite(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	token := chi.URLParam(r, "token")
	campaign, found := h.store.GetCampaignByInviteToken(token)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "invite not found")
		return
	}

	joined, err := h.store.JoinCampaign(campaign.ID, user.ID)
	h.writeJoinResult(w, joined, err)
}

// GetCampaignInviteLink отдаёт мастеру токен инвайт-ссылки кампании.
// Только здесь токен покидает бэкенд — из ответов с кампанией его вычищает
// enrichCampaign.
func (h *Handler) GetCampaignInviteLink(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	token, err := h.store.EnsureCampaignInviteToken(campaignID)
	if err != nil {
		if err == store.ErrCampaignNotFound {
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
			return
		}
		httpx.WriteError(w, http.StatusInternalServerError, "failed to get invite link")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"token": token})
}

// ResetCampaignInviteLink генерирует новый токен: все разосланные ранее
// ссылки перестают действовать.
func (h *Handler) ResetCampaignInviteLink(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	token, err := h.store.ResetCampaignInviteToken(campaignID)
	if err != nil {
		if err == store.ErrCampaignNotFound {
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
			return
		}
		httpx.WriteError(w, http.StatusInternalServerError, "failed to reset invite link")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"token": token})
}

func (h *Handler) JoinCampaign(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	campaignID := chi.URLParam(r, "campaignID")
	campaign, err := h.store.JoinCampaign(campaignID, user.ID)
	h.writeJoinResult(w, campaign, err)
}

func (h *Handler) writeJoinResult(w http.ResponseWriter, campaign models.Campaign, err error) {
	if err != nil {
		switch err {
		case store.ErrCampaignNotFound:
			httpx.WriteError(w, http.StatusNotFound, "campaign not found")
		case store.ErrAlreadyMember:
			httpx.WriteJSON(w, http.StatusOK, h.enrichCampaign(campaign))
		case store.ErrCampaignFull:
			httpx.WriteError(w, http.StatusConflict, "campaign is full")
		case store.ErrCampaignNotActive:
			httpx.WriteError(w, http.StatusConflict, "campaign is not accepting players")
		default:
			httpx.WriteError(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	httpx.WriteJSON(w, http.StatusOK, h.enrichCampaign(campaign))
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
	isMaster, err := h.store.IsCampaignMaster(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMaster {
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
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
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
	isMember, err := h.store.IsCampaignMember(campaignID, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if !isMember {
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

func (h *Handler) enrichCampaign(campaign models.Campaign) models.Campaign {
	// Токен инвайт-ссылки — секрет мастера: наружу только через /invite-link.
	campaign.InviteToken = ""
	profile := models.CampaignMasterProfile{Name: campaign.MasterName}
	if p, found := h.store.GetProfile(campaign.MasterID); found {
		if p.Name != "" {
			profile.Name = p.Name
		}
		profile.Description = p.Description
		profile.AvatarURL = p.AvatarURL
	}
	campaign.MasterProfile = &profile
	return campaign
}

func (h *Handler) enrichCampaigns(campaigns []models.Campaign) []models.Campaign {
	enriched := make([]models.Campaign, len(campaigns))
	for i, campaign := range campaigns {
		enriched[i] = h.enrichCampaign(campaign)
	}
	return enriched
}

func buildQuestionnaireFields(settings []models.QuestionnaireFieldSetting) []models.QuestionnaireField {
	if len(settings) == 0 {
		return []models.QuestionnaireField{}
	}
	// Fallback, если клиент не передал questionnaireFields (основной путь — с фронтенда).
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
