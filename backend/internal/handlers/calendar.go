package handlers

import (
	"net/http"

	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) ListCalendarEvents(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.store.ListCalendarEventsForUser(user.ID))
}

func (h *Handler) CreateCalendarEvent(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateCalendarEventRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Date == "" || req.Title == "" {
		httpx.WriteError(w, http.StatusBadRequest, "date and title are required")
		return
	}

	if req.CampaignID != "" && !h.store.IsCampaignMember(req.CampaignID, user.ID) {
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
		return
	}

	event := h.store.CreateCalendarEvent(models.CalendarEvent{
		Date:       req.Date,
		Time:       req.Time,
		Title:      req.Title,
		CampaignID: req.CampaignID,
		Campaign:   req.Campaign,
		Place:      req.Place,
		CreatedBy:  user.ID,
	})
	httpx.WriteJSON(w, http.StatusCreated, event)
}
