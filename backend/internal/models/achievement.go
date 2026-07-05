package models

import "time"

type AntiAchievement struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	EarnedAt  time.Time `json:"earnedAt"`
}

type AssignAchievementRequest struct {
	Title string `json:"title"`
}
