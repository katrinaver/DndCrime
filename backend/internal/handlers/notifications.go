package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
)

func (h *Handler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.store.ListNotifications(user.ID))
}

func (h *Handler) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	notificationID := chi.URLParam(r, "notificationID")
	n, found := h.store.MarkNotificationRead(user.ID, notificationID)
	if !found {
		httpx.WriteError(w, http.StatusNotFound, "notification not found")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, n)
}

func (h *Handler) MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	count := h.store.MarkAllNotificationsRead(user.ID)
	httpx.WriteJSON(w, http.StatusOK, map[string]int{"marked": count})
}
