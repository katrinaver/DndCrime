package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/models"
)

func (h *Handler) ListNewsPosts(w http.ResponseWriter, r *http.Request) {
	_, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, h.store.ListNewsPosts())
}

func (h *Handler) CreateNewsPost(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateNewsPostRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Content == "" {
		httpx.WriteError(w, http.StatusBadRequest, "content is required")
		return
	}

	post := h.store.CreateNewsPost(models.NewsPost{
		AuthorID: user.ID,
		Author:   authorName(h, user),
		Content:  req.Content,
		Campaign: req.Campaign,
	})
	httpx.WriteJSON(w, http.StatusCreated, post)
}

func (h *Handler) AddNewsComment(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	postID := chi.URLParam(r, "postID")
	var req models.CreateNewsCommentRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Content == "" {
		httpx.WriteError(w, http.StatusBadRequest, "content is required")
		return
	}

	post, ok := h.store.AddNewsComment(postID, models.NewsComment{
		AuthorID: user.ID,
		Author:   authorName(h, user),
		Content:  req.Content,
	})
	if !ok {
		httpx.WriteError(w, http.StatusNotFound, "post not found")
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, post)
}
