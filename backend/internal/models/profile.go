package models

import "time"

type UserProfile struct {
	UserID      string    `json:"userId"`
	Email       string    `json:"email"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	AvatarURL   string    `json:"avatarUrl,omitempty"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type UpdateProfileRequest struct {
	Email       string `json:"email"`
	Name        string `json:"name"`
	Description string `json:"description"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}
