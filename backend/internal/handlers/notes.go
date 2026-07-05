package handlers

import (
	"net/http"

	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) GetNote(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	note, found := h.store.GetNote(user.ID)
	if !found {
		note = models.Note{UserID: user.ID, Content: ""}
	}
	httpx.WriteJSON(w, http.StatusOK, note)
}

func (h *Handler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.UpdateNoteRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}

	note := h.store.SaveNote(models.Note{UserID: user.ID, Content: req.Content})
	httpx.WriteJSON(w, http.StatusOK, note)
}
