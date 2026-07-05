package models

import "time"

type Note struct {
	UserID    string    `json:"userId"`
	Content   string    `json:"content"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UpdateNoteRequest struct {
	Content string `json:"content"`
}
